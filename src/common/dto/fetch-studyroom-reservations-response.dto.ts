import type { AxiosResponse } from 'axios';

export class StudyroomReservationDto {
  bookingId!: string | null;
  ipid!: string | null;
  roomName!: string;
  duration!: string | null;
  date!: string;
  startsAt!: string | null;

  static from(value: unknown): StudyroomReservationDto {
    if (!this.isRecord(value)) {
      throw new TypeError('스터디룸 예약 정보가 객체 형식이 아닙니다.');
    }

    const dto = new StudyroomReservationDto();
    dto.bookingId = this.getNullableString(value, 'booking_id');
    dto.ipid = this.getNullableString(value, 'ipid');
    dto.roomName = this.getString(value, 'room_name');
    dto.duration = this.getNullableString(value, 'duration');
    dto.date = this.getString(value, 'date');
    dto.startsAt = this.getNullableString(value, 'starts_at');
    return dto;
  }

  private static getNullableString(
    value: Record<string, unknown>,
    key: string,
  ): string | null {
    const field = value[key];

    if (typeof field === 'string') {
      return field;
    }

    if (field === null) {
      return null;
    }

    throw new TypeError(
      `스터디룸 예약 정보의 ${key} 필드가 올바르지 않습니다.`,
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
      `스터디룸 예약 정보의 ${key} 필드가 문자열이 아닙니다.`,
    );
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}

export class FetchStudyroomReservationsResponseDto {
  status!: number;
  reservations!: StudyroomReservationDto[];
  errorMessage?: string;

  static from(
    response: Pick<AxiosResponse<string>, 'data' | 'status'>,
  ): FetchStudyroomReservationsResponseDto {
    const dto = new FetchStudyroomReservationsResponseDto();
    dto.status = response.status;
    const body = this.parseBody(response.data);
    dto.reservations = body.reservations;
    dto.errorMessage = body.errorMessage;
    return dto;
  }

  private static parseBody(data: string): {
    readonly reservations: StudyroomReservationDto[];
    readonly errorMessage?: string;
  } {
    let parsed: unknown;

    try {
      parsed = JSON.parse(data);
    } catch {
      throw new TypeError('스터디룸 예약 목록 응답이 JSON 형식이 아닙니다.');
    }

    if (!this.isRecord(parsed)) {
      throw new TypeError('스터디룸 예약 목록 응답이 객체 형식이 아닙니다.');
    }

    const result = parsed['result'];
    if (Array.isArray(result)) {
      return {
        reservations: result.map((reservation) =>
          StudyroomReservationDto.from(reservation),
        ),
      };
    }

    if (typeof result === 'string') {
      return { reservations: [], errorMessage: result };
    }

    throw new TypeError('스터디룸 예약 목록 응답에 예약 배열이 없습니다.');
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
