# segam AWS Lambda v2 기준 백엔드 수정사항

`segamAWSlambda` Postman 컬렉션의 저장된 요청·응답을 현재 스터디룸 연동 코드와 비교한 결과다.
컬렉션에 포함된 실제 URL, 학번, 비밀번호, 예약 번호는 이 문서에 기록하지 않는다.

## 범위와 근거

컬렉션에는 다음 Lambda v2 API 네 개가 있다. 고전독서·포털·eCampus API에는 변경사항이 없으므로 이번 수정 범위에서 제외한다.

| Lambda v2 API          | 현재 백엔드 메서드           | 환경변수                    |
| ---------------------- | ---------------------------- | --------------------------- |
| `getMyReservations_v2` | `fetchStudyroomReservations` | `GET_USER_RESERVATIONS_URL` |
| `createReservation_v2` | `createStudyroomReservation` | `CREATE_RESERVATION_URL`    |
| `studyroomCrawler_v2`  | `fetchStudyroom`             | `CRAWLER_API_ROOT`          |
| `cancelReservation_v2` | `cancelStudyroomReservation` | `CANCEL_RESERVATION_URL`    |

예약 가능 여부 API(`GET_USER_AVAILABILITY_URL`)는 Lambda에서 삭제됐다. 사용자 확인 실패는 `createReservation_v2`가 422 응답으로 반환한다.

## 우선순위별 수정사항

### P0: HTTP 오류 응답을 서비스가 일관되게 수신하게 한다

Postman 컬렉션은 편의상 GET으로 작성됐지만, Lambda는 현재 백엔드의 `POST` JSON 요청도 허용한다. 따라서 HTTP 메서드 변경은 필요 없다.

다만 Axios 기본 동작은 4xx/5xx를 reject한다. 현재 예약 서비스는 `response.status === 401` 같은 분기를 사용하므로, 다음 둘 중 하나가 필요하다.

1. 해당 외부 요청에 `validateStatus: () => true`를 설정해 모든 HTTP 상태를 응답으로 받는다.
2. `AxiosError`를 한 곳에서 변환해 응답 본문과 상태를 보존한다.

이 처리가 없으면 컬렉션에 있는 401·422 응답은 서비스의 상태 코드 분기로 전달되지 않는다.

### P0: 예약 취소 계약을 교체한다

컬렉션의 `cancelReservation_v2` 계약은 현재 코드와 다르다.

| 항목           | Lambda v2                                                                   | 현재 백엔드                                  |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| 요청 예약 번호 | `reserve_no`                                                                | `booking_id`                                 |
| 성공 `result`  | `{ ok: boolean, resultCode: string, resultMsg: string, reserveNo: string }` | `ResultResponse`의 `result: string`으로 취급 |
| 업무 실패      | HTTP 200 + `result.ok: false`                                               | HTTP 상태만 검사한 뒤 DB 예약을 삭제         |
| 인증 실패      | HTTP 401 + `{ result: string }`                                             | `result` 문자열을 소비                       |

필수 변경:

1. [external-api.type.ts](../src/common/types/external-api.type.ts)의 취소 요청 필드를 `reserveNo`로 바꾸고 Lambda 요청에서는 `reserve_no`로 직렬화한다.
2. 취소 응답 DTO를 만들고 `result.ok`, `resultCode`, `resultMsg`, `reserveNo`를 타입으로 표현한다.
3. [reservation.service.ts](../src/studyroom/reservation.service.ts)에서 `result.ok === false`이면 DB를 삭제하지 않고 적절한 예외를 반환한다.
4. 예약 목록의 `booking_id`를 DB `bookingId`에 저장하고, 취소 요청에서 `reserve_no`로 직렬화한다.

`reserve_no`는 `getMyReservations_v2`의 `booking_id`를 사용한다. 따라서 현재 DB의 `bookingId` 필드는 유지할 수 있다. 단, `booking_id`가 `null`인 항목은 취소할 수 없으므로 현재의 예약 취소 전 검증을 유지해야 한다.

### P0: 예약 목록 DTO와 동기화 로직이 nullable 응답을 처리하게 한다

`getMyReservations_v2`의 성공 샘플에는 다음과 같은 항목이 실제로 있다.

```json
{
  "booking_id": null,
  "ipid": null,
  "room_name": "…",
  "duration": null,
  "date": "YYYY.MM.DD",
  "starts_at": null
}
```

현재 [fetch-studyroom-reservations-response.dto.ts](../src/common/dto/fetch-studyroom-reservations-response.dto.ts)는 `duration`과 `startsAt`을 `string`으로 요구한다. 이 응답은 DTO 변환에서 실패한다. 이전 raw 타입도 같은 필드를 `string`으로 선언해 실제 계약과 다르다.

필수 변경:

1. 외부 예약 항목의 `duration`, `starts_at`을 `string | null`로 모델링한다.
2. [studyroom.repository.ts](../src/studyroom/studyroom.repository.ts)의 동기화 전에 `duration` 또는 `starts_at`이 없는 항목의 처리 정책을 정한다. 현 저장 로직은 시간·기간이 있는 예약만 저장할 수 있다.
3. 정책이 “불완전 항목 무시”라면, DTO 또는 서비스 경계에서 이를 명시적으로 필터링한다. 정책이 “보관”이라면 Prisma 스키마와 DB 필드도 nullable로 바꿔야 한다.

현재 코드처럼 nullable 값을 문자열로 가정하면 DTO 예외, 잘못된 키 생성, 또는 잘못된 기간 저장이 발생할 수 있다.

### P1: 예약 생성 오류 계약을 DTO와 HTTP 예외에 반영한다

`createReservation_v2`의 컬렉션 응답은 다음을 포함한다.

| 상황                    | HTTP | 응답                                 |
| ----------------------- | ---- | ------------------------------------ |
| 성공                    | 200  | `{ result: string }`                 |
| 이용자 학번·이름 불일치 | 422  | `{ error: string, content: string }` |
| 인증 실패               | 401  | `{ error: string }`                  |

현재 [create-studyroom-reservation-response.dto.ts](../src/common/dto/create-studyroom-reservation-response.dto.ts)는 `result`와 `error`만 보관한다. `content`를 보존하지 않고, [reservation.service.ts](../src/studyroom/reservation.service.ts)는 422를 내부 오류로 처리한다.

필수 변경:

1. 생성 응답 DTO에 `content?: string`을 추가한다.
2. 422를 `BadRequestException`으로 변환하고 `error`와 필요하면 `content`를 클라이언트에 전달한다.
3. 401에서는 DTO 전체가 아니라 `response.error`를 예외 메시지로 사용한다.

추가 확인 사항: 컬렉션의 생성 요청은 `year`를 문자열로 보낸다. 현재 백엔드는 숫자로 전송한다. Lambda 구현이 숫자도 허용하는지 확인하고, 문자열만 허용한다면 `toDateParts()`의 `year`를 문자열로 맞춘다.

### P1: 삭제된 예약 가능 여부 API 의존성을 제거한다

`GET_USER_AVAILABILITY_URL`과 해당 Lambda는 더 이상 존재하지 않는다. 잘못된 스터디룸 이용자는 예약 생성에서 422로 검증한다.

현재 백엔드에서 정리할 대상:

| 계층                     | 제거 또는 변경 대상                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 설정                     | `GET_USER_AVAILABILITY_URL` 환경변수 검증                                                                    |
| 외부 API                 | `ExternalApiService.fetchStudyroomAvailability()`와 endpoint 상수                                            |
| 테스트                   | 외부 API 스터디룸 테스트의 예약 가능 여부 사례                                                               |
| 예약 서비스              | `ReservationService.checkUserAvailablity()`                                                                  |
| 사용자 서비스            | `UserService.getUserPid()` 및 친구 추가 시의 외부 검증 경로                                                  |
| 스터디룸 서비스·컨트롤러 | `StudyroomService.checkUserAvailablity()`와 `POST /studyroom/user` API, `StudyroomUserPayload`, `UserPidDto` |

친구 추가는 현재 존재하지 않는 사용자를 이 API로 검증한 뒤 PID를 저장한다. 삭제 후에는 “친구 추가 시 검증하지 않고 관계만 저장”할지, “이미 등록된 사용자만 친구로 허용”할지 제품 정책을 정해야 한다. 예약 시에는 Lambda의 422 응답을 사용자에게 반환해 잘못된 동반인을 알려준다.

### P1: 크롤러 응답의 날짜 타입을 문자열로 바로잡는다

`studyroomCrawler_v2`는 슬롯의 `date`를 `"YYYY-MM-DD"` 문자열로 반환한다. 현재 [rawStudyroom.d.ts](../src/studyroom/types/rawStudyroom.d.ts)는 이를 `Date`로 선언한다.

수정 대상:

- `RawStudyroomSlot.date: string`
- [studyroom.service.ts](../src/studyroom/studyroom.service.ts)에서 DB 저장 시 `new Date(slot.date)`로 변환하는 현재 로직은 유지 가능

잘못된 스터디룸 이름은 HTTP 200과 빈 `slots: []`를 반환한다. 현재 로직도 빈 배열을 안전하게 처리하므로 추가 변경은 필요 없다.

## 권장 작업 순서

1. 공통 HTTP 응답 수신 정책(`validateStatus` 또는 오류 변환)을 정한다.
2. 예약 목록 nullable 필드 처리 정책을 확정하고 DTO·저장소를 수정한다.
3. 취소 요청·응답 DTO와 DB 삭제 조건을 수정한다.
4. 예약 생성 422 DTO·예외 처리를 수정한다.
5. 크롤러 날짜 타입을 수정한다.
6. Postman 컬렉션의 성공·401·422·`ok: false` 응답을 fixture로 옮겨 회귀 테스트를 추가한다.

## 수정 범위 밖 항목

- 고전독서, 포털, eCampus API는 변경사항 없음
