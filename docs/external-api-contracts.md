# 외부 API 호출 및 응답 계약

이 문서는 현재 `ExternalApiService`가 호출하는 외부 API를 코드 기준으로 정리한다.
실제 운영 URL, 자격 증명, 쿠키 값은 기록하지 않는다.

## 읽는 법

- **근거**는 응답 형태를 확인한 위치다. `코드 소비`는 실제 HTTP 응답 캡처가 아니라, 현재 서버가 응답을 읽는 방식을 뜻한다.
- **미확인**은 코드에 구체적인 타입 또는 예시가 없어 실제 외부 API 응답으로 검증해야 하는 부분이다.
- 환경변수 기반 API의 URL은 해당 환경변수에 설정한다. 설정 키는 [config.module.ts](../src/app/modules/config.module.ts)에서 필수값으로 검증된다.

## 공통 전송 방식

- 대부분의 요청은 `POST`, `Content-Type: application/json`이며 본문은 JSON 문자열이다.
- `fetchGodokCalendar`만 `GET`이다.
- `fetchGodokBooks`는 `multipart/form-data`로 전송한다.
- HTTP 응답 본문은 원래 문자열로 받아 왔다. 스터디룸 예약 목록·생성·취소는 현재 외부 API 서비스에서 DTO로 변환하며, 나머지는 각 소비 서비스가 `JSON.parse`한다.

> 스터디룸 Lambda 요청은 `validateStatus: () => true`를 사용하므로 4xx/5xx도 DTO 변환과 상태 코드 분기에 도달한다. 다른 외부 API 요청은 Axios 기본 동작을 따른다.

## 포털 및 eCampus

### 포털 인증

| 항목        | 내용                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 메서드      | `authenticatePortal`                                                                                                                                                                    |
| URL 설정 키 | `PORTAL_AUTH_URL`                                                                                                                                                                       |
| 요청        | `{ id: string, password: string }`                                                                                                                                                      |
| 성공 응답   | `{ name: string, department: string, grade: number, studentId: string, year: number }`                                                                                                  |
| 오류 처리   | HTTP 상태가 200이 아니면 인증 실패로 처리                                                                                                                                               |
| 근거        | [external-api.service.ts](../src/common/services/external-api.service.ts), [portal-user.type.ts](../src/auth/types/portal-user.type.ts), [auth.service.ts](../src/auth/auth.service.ts) |

### eCampus 출석 조회

| 항목            | 내용                                                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 메서드          | `fetchCourseAttendance`                                                                                                |
| URL 설정 키     | `GET_COURSE_ATTENDANCE_URL`                                                                                            |
| 요청            | `{ studentId: string, name: string, password: string }`                                                                |
| 성공 응답       | `RawCourse[]`                                                                                                          |
| `RawCourse`     | `{ id: string, name: string, ecampusId: number, lectures: RawLecture[], assignments: RawAssignment[] }`                |
| `RawLecture`    | `{ id: number, name: string, week: number, startsAt: Date, endsAt: Date, isDone: boolean }`                            |
| `RawAssignment` | `{ id: number, name: string, week: number, endsAt?: Date, isDone: boolean }`                                           |
| 오류 처리       | 500: 출석 Lambda 오류, 401: 로그인 실패, 400: 강의 정보 조회 실패                                                      |
| 근거            | [ecampus.service.ts](../src/attendance/ecampus.service.ts), [raw-course.d.ts](../src/attendance/types/raw-course.d.ts) |

## 스터디룸

### 스터디룸 슬롯 크롤링

| 항목               | 내용                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 메서드             | `fetchStudyroom`                                                                                                             |
| URL 설정 키        | `CRAWLER_API_ROOT`                                                                                                           |
| 요청               | `{ room_name: string }`                                                                                                      |
| 성공 응답          | `{ room_name: string, slots: RawStudyroomSlot[] }`                                                                           |
| `RawStudyroomSlot` | `{ date: string, time: string, is_reserved: boolean, is_closed: boolean }`                                                   |
| 오류 처리          | `slots`가 배열이 아니면 경고를 남기고 처리 중단                                                                              |
| 근거               | [studyroom.service.ts](../src/studyroom/studyroom.service.ts), [rawStudyroom.d.ts](../src/studyroom/types/rawStudyroom.d.ts) |

### 사용자 예약 목록

| 항목            | 내용                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 메서드          | `fetchStudyroomReservations`                                                                                                                                                      |
| URL 설정 키     | `GET_USER_RESERVATIONS_URL`                                                                                                                                                       |
| 요청            | `{ student_id: string, password: string }`                                                                                                                                        |
| 성공 응답 원본  | `{ result: ReservationResponse[] }`                                                                                                                                               |
| 원본 예약 항목  | `{ booking_id: string \| null, ipid: string \| null, room_name: string, duration: string \| null, date: string, starts_at: string \| null }`                                      |
| 서비스 반환 DTO | `{ status: number, reservations: StudyroomReservationDto[], errorMessage?: string }`                                                                                              |
| DTO 예약 항목   | `{ bookingId: string \| null, ipid: string \| null, roomName: string, duration: string \| null, date: string, startsAt: string \| null }`                                         |
| 동기화 정책     | `duration` 또는 `starts_at`이 `null`인 항목은 취소된 예약으로 간주해 DB에서 제거하고 응답에서 제외한다.                                                                           |
| 오류 처리       | 404: 빈 예약 목록으로 동기화, 401: `result` 문자열을 인증 오류 메시지로 처리                                                                                                      |
| 근거            | [fetch-studyroom-reservations-response.dto.ts](../src/common/dto/fetch-studyroom-reservations-response.dto.ts), [reservation.service.ts](../src/studyroom/reservation.service.ts) |

### 사용자 예약 가능 여부 (삭제됨)

| 항목         | 내용                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 현재 상태    | Lambda와 백엔드에서 삭제됨                                                            |
| 과거 메서드  | `fetchStudyroomAvailability`                                                          |
| 과거 설정 키 | `GET_USER_AVAILABILITY_URL`                                                           |
| 대체 계약    | 예약 생성 API가 잘못된 이용자를 HTTP 422으로 반환                                     |
| 근거         | Lambda 변경 정보 및 [reservation.service.ts](../src/studyroom/reservation.service.ts) |

### 예약 생성

| 항목            | 내용                                                                                                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 메서드          | `createStudyroomReservation`                                                                                                                                                      |
| URL 설정 키     | `CREATE_RESERVATION_URL`                                                                                                                                                          |
| 요청            | `{ id, password, room_id, users, year, month, day, start_time, hours }`                                                                                                           |
| `users`         | `Array<{ student_id: string, name: string }>`                                                                                                                                     |
| 성공 응답 원본  | `{ result: string }`                                                                                                                                                              |
| 서비스 반환 DTO | `{ status: number, result: string, error?: string, content?: string }`                                                                                                            |
| 오류 처리       | 400/422는 `{ message: error, content }`의 HTTP 400, 401은 `error` 문자열의 HTTP 401                                                                                               |
| 근거            | [create-studyroom-reservation-response.dto.ts](../src/common/dto/create-studyroom-reservation-response.dto.ts), [reservation.service.ts](../src/studyroom/reservation.service.ts) |

### 예약 취소

| 항목        | 내용                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 메서드      | `cancelStudyroomReservation`                                                                                                               |
| URL 설정 키 | `CANCEL_RESERVATION_URL`                                                                                                                   |
| 요청        | `{ id: string, password: string, reserve_no: string, cancel_msg?: string }`                                                                |
| 성공 응답   | `{ result: { ok: true, resultCode: string, resultMsg: string, reserveNo: string } }`를 서버가 HTTP 201 빈 본문으로 처리                    |
| 업무 실패   | HTTP 200의 `result.ok: false`는 HTTP 404로 변환하고 DB 예약을 유지                                                                         |
| 오류 처리   | 401은 외부 오류 문자열을 HTTP 401로 변환하고, 그 외 4xx/5xx는 내부 오류                                                                    |
| 근거        | [reservation.service.ts](../src/studyroom/reservation.service.ts), [resultResponse.type.ts](../src/studyroom/types/resultResponse.type.ts) |

## 고전독서

### 캘린더 조회

| 항목        | 내용                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------ |
| 메서드      | `fetchGodokCalendar`                                                                                               |
| URL 설정 키 | `GET_GODOK_CALENDAR_URL`                                                                                           |
| 요청        | 본문 없음 (`GET`)                                                                                                  |
| 성공 응답   | `Array<{ data_id: string, date_time: string, available_seats: number, total_seats: number }>`                      |
| 근거        | [rawGodokSlot.type.ts](../src/godok/types/rawGodokSlot.type.ts), [godok.service.ts](../src/godok/godok.service.ts) |

### 예약 생성

| 항목        | 내용                                                            |
| ----------- | --------------------------------------------------------------- |
| 메서드      | `createGodokReservation`                                        |
| URL 설정 키 | `CREATE_GODOK_RESERVATION_URL`                                  |
| 요청        | `{ student_id, password, shInfoId, bkCode, bkAreaCode }`        |
| 성공 응답   | `ResultResponse`로 반환하는 것으로 사용됨: `{ result: string }` |
| 오류 응답   | 400/401에서 `{ message: string }`을 소비                        |
| 근거        | [godok.service.ts](../src/godok/godok.service.ts)               |

### 사용자 예약 목록

| 항목        | 내용                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 메서드      | `fetchGodokReservations`                                                                                                                   |
| URL 설정 키 | `GET_USER_GODOK_RESERVATIONS_URL`                                                                                                          |
| 요청        | `{ student_id: string, password: string }`                                                                                                 |
| 성공 응답   | `{ reservations: Array<{ date_time: string, book_name: string, reserve_id: string }> }`                                                    |
| 오류 응답   | 400/401에서 `{ error: string }`을 소비                                                                                                     |
| 근거        | [godokReservationResponse.type.ts](../src/godok/types/godokReservationResponse.type.ts), [godok.service.ts](../src/godok/godok.service.ts) |

### 도서 목록

| 항목      | 내용                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 메서드    | `fetchGodokBooks`                                                                                                                    |
| URL       | `http://classic.sejong.ac.kr/seletTermBookList.json`                                                                                 |
| 요청      | `multipart/form-data`: `opTermId=TERM-00571`, `bkAreaCode: number`                                                                   |
| 성공 응답 | `{ results: Array<{ bkAreaCode: number, bkAreaName: string, bkCode: number, bkName: string, appCount: number, bkStatus: string }> }` |
| 근거      | [external-api.service.ts](../src/common/services/external-api.service.ts), [godok.service.ts](../src/godok/godok.service.ts)         |

### 예약 취소

| 항목        | 내용                                                            |
| ----------- | --------------------------------------------------------------- |
| 메서드      | `cancelGodokReservation`                                        |
| URL 설정 키 | `CANCEL_GODOK_RESERVATION_URL`                                  |
| 요청        | `{ student_id: string, password: string, opAppInfoId: string }` |
| 성공 응답   | 본문 형식은 현재 사용하지 않음                                  |
| 오류 응답   | 400/401에서 `{ error: string }`을 소비                          |
| 근거        | [godok.service.ts](../src/godok/godok.service.ts)               |

### 사용자 상태

| 항목        | 내용                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| 메서드      | `fetchGodokStatus`                                                                                                       |
| URL 설정 키 | `GET_USER_GODOK_STATUS_URL`                                                                                              |
| 요청        | `{ student_id: string, password: string }`                                                                               |
| 성공 응답   | `{ reservations: { status: boolean, values: Record<string, number> } }`                                                  |
| 오류 응답   | 400/401에서 `{ error: string }`을 소비                                                                                   |
| 근거        | [godokStatusInfo.type.ts](../src/godok/types/godokStatusInfo.type.ts), [godok.service.ts](../src/godok/godok.service.ts) |

## 응답 계약 검증 상태

현재 저장소에는 외부 API의 실응답 fixture나 OpenAPI 명세가 없다. 따라서 이 문서의 형식은 다음 근거에서만 작성됐다.

1. `ExternalApiService`의 요청 조립 방식
2. 응답을 파싱해 사용하는 서비스 코드
3. 해당 서비스가 전달하는 기존 TypeScript 타입

새 DTO를 추가하거나 기존 응답을 변경하기 전에, 운영 비밀값을 제거한 실응답 샘플 또는 외부 API의 소스/명세로 각 계약을 확인해야 한다.
