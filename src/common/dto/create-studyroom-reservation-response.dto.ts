import type { AxiosResponse } from 'axios';

export class CreateStudyroomReservationResponseDto {
  status!: number;
  result!: string;
  error?: string;
  content?: string;

  static from(
    response: Pick<AxiosResponse<string>, 'data' | 'status'>,
  ): CreateStudyroomReservationResponseDto {
    const dto = new CreateStudyroomReservationResponseDto();
    dto.status = response.status;
    const body = this.parseBody(response.data);
    dto.result = body.result ?? '';
    dto.error = body.error;
    dto.content = body.content;
    return dto;
  }

  private static parseBody(data: string): {
    readonly result?: string;
    readonly error?: string;
    readonly content?: string;
  } {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data);
    } catch {
      throw new TypeError('스터디룸 예약 생성 응답이 JSON 형식이 아닙니다.');
    }

    if (!this.isResponseBody(parsed)) {
      throw new TypeError(
        '스터디룸 예약 생성 응답에 result 또는 error 문자열이 없습니다.',
      );
    }

    return {
      result:
        typeof parsed['result'] === 'string' ? parsed['result'] : undefined,
      error: typeof parsed['error'] === 'string' ? parsed['error'] : undefined,
      content:
        typeof parsed['content'] === 'string' ? parsed['content'] : undefined,
    };
  }

  private static isResponseBody(
    value: unknown,
  ): value is Record<string, unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      ('result' in value || 'error' in value)
    );
  }
}
