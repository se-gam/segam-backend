import type { AxiosResponse } from 'axios';

export class CancelStudyroomReservationResultDto {
  ok!: boolean;
  resultCode!: string;
  resultMessage!: string;
  reserveNo!: string;

  static from(value: unknown): CancelStudyroomReservationResultDto {
    if (!this.isRecord(value)) {
      throw new TypeError('스터디룸 예약 취소 결과가 객체 형식이 아닙니다.');
    }

    const dto = new CancelStudyroomReservationResultDto();
    dto.ok = this.getBoolean(value, 'ok');
    dto.resultCode = this.getString(value, 'resultCode');
    dto.resultMessage = this.getString(value, 'resultMsg');
    dto.reserveNo = this.getString(value, 'reserveNo');
    return dto;
  }

  private static getBoolean(
    value: Record<string, unknown>,
    key: string,
  ): boolean {
    const field = value[key];

    if (typeof field === 'boolean') {
      return field;
    }

    throw new TypeError(
      `스터디룸 예약 취소 결과의 ${key} 필드가 불리언이 아닙니다.`,
    );
  }

  private static getString(
    value: Record<string, unknown>,
    key: string,
  ): string {
    const field = value[key];

    if (typeof field === 'string') {
      return field;
    }

    throw new TypeError(
      `스터디룸 예약 취소 결과의 ${key} 필드가 문자열이 아닙니다.`,
    );
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}

export class CancelStudyroomReservationResponseDto {
  status!: number;
  result?: CancelStudyroomReservationResultDto;
  errorMessage?: string;

  static from(
    response: Pick<AxiosResponse<string>, 'data' | 'status'>,
  ): CancelStudyroomReservationResponseDto {
    const dto = new CancelStudyroomReservationResponseDto();
    dto.status = response.status;

    const body = this.parseBody(response.data);
    dto.result = body.result;
    dto.errorMessage = body.errorMessage;
    return dto;
  }

  private static parseBody(data: string): {
    readonly result?: CancelStudyroomReservationResultDto;
    readonly errorMessage?: string;
  } {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data);
    } catch {
      throw new TypeError('스터디룸 예약 취소 응답이 JSON 형식이 아닙니다.');
    }

    if (!this.isRecord(parsed)) {
      throw new TypeError('스터디룸 예약 취소 응답이 객체 형식이 아닙니다.');
    }

    const result = parsed['result'];
    if (typeof result === 'string') {
      return { errorMessage: result };
    }

    return { result: CancelStudyroomReservationResultDto.from(result) };
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
