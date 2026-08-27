# 스터디룸 API 클라이언트 응답 변경사항

Lambda v2 연동 변경 후, 클라이언트가 받는 백엔드 HTTP API의 차이만 정리한다.
고전독서·포털·eCampus API는 이 변경 범위에 포함되지 않는다.

## 변경 요약

| API 또는 상황                                       | 이전 동작                                                   | 현재 동작                                        | 클라이언트 대응                                                 |
| --------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| `POST /studyroom/user`                              | 스터디룸 인원 추가 가능 여부를 확인하고 `UserPidDto`를 반환 | **삭제됨**                                       | 이 API 호출을 제거한다. 동반인 유효성은 예약 생성에서 확인한다. |
| `POST /studyroom/reservation` 성공                  | 201, 빈 본문                                                | 동일                                             | 변경 없음                                                       |
| 예약 생성: 잘못된 동반인                            | 외부 오류가 일관되게 전달되지 않음                          | HTTP 400으로 검증 오류 반환                      | `message`와 `content`를 표시한다.                               |
| 예약 생성: 포털 인증 실패                           | 응답 메시지가 DTO 전체가 될 수 있음                         | HTTP 401, 외부 API의 오류 문자열을 메시지로 반환 | 기존 401 처리 유지                                              |
| `POST /studyroom/reservation/cancel/:id` 성공       | 201, 빈 본문                                                | 동일                                             | 변경 없음                                                       |
| 예약 취소: 외부 API가 `200 + result.ok: false` 반환 | 성공으로 간주되어 DB 예약이 삭제될 수 있음                  | HTTP 404, DB 예약을 유지                         | 404를 “외부 예약이 존재하지 않음”으로 안내한다.                 |
| `POST /studyroom/reservation/me`                    | 시간·기간이 없는 외부 예약도 목록에 남을 수 있음             | `duration` 또는 `starts_at`이 `null`인 항목은 삭제·제외 | 취소된 예약은 목록에서 제거된다.                               |
| `POST /studyroom/reservation/me` 401                | 외부 응답을 직접 파싱                                       | 외부 `result` 문자열을 401 메시지로 반환         | 기존 401 처리에서 메시지 문자열을 표시한다.                     |
| `POST /user/friend`로 미등록 사용자 추가            | 외부 예약 가능 여부 API로 학번·이름을 사전 검증             | 로컬 친구 관계를 먼저 만들고 예약 생성에서 검증  | 친구 추가 성공이 예약 가능을 보장하지 않는다.                   |

## 예약 생성 오류 응답

Lambda가 동반인 학번·이름 불일치를 반환하면, 백엔드는 HTTP 400을 반환한다.

```json
{
  "message": "이름과 학번이 일치하지 않는 이용자가 있습니다.",
  "content": "학번-이름"
}
```

`content`는 문제가 된 동반인을 식별하는 Lambda 제공 값이다. 실제 값에는 개인 정보가 포함될 수 있으므로, 로그에 기록할 때는 마스킹한다.

## 삭제된 사전 검증 흐름

기존 흐름은 다음 API를 사용했다.

```text
POST /studyroom/user → 외부 예약 가능 여부 API → PID 반환
```

새 흐름에서는 해당 API가 없다.

```text
POST /user/friend → 로컬 친구 관계 생성
POST /studyroom/reservation → Lambda가 동반인 검증 → 성공 또는 400
```

따라서 예약 UI는 친구 선택 이후가 아니라 예약 제출 이후에도 동반인 검증 오류를 표시할 수 있어야 한다.

## 변경되지 않은 성공 응답

- `POST /studyroom/reservation`: HTTP 201, 빈 본문
- `POST /studyroom/reservation/cancel/:id`: HTTP 201, 빈 본문
- `POST /studyroom/reservation/me`: `{ reservations: Array<{ id, name, date, startsAt: string | null, duration: number | null }> }`

예약 목록의 공개 DTO 필드명은 변경하지 않았다. 외부 Lambda의 `booking_id`와 `ipid`는 취소를 위해 서버 DB에만 저장하며, 클라이언트 응답에는 포함하지 않는다.
