import { ApiProperty } from '@nestjs/swagger';
import { StudyroomReservationInfo } from '../types/studyroomReservationInfo.type';

export class StudyroomReservationDto {
  @ApiProperty({
    description: '스터디룸 예약 id',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '스터디룸 이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '이용 날짜',
    type: Date,
  })
  date!: Date;

  @ApiProperty({
    description: '이용 시작 시간',
    type: String,
  })
  startsAt!: string;

  @ApiProperty({
    description: '이용 시간',
    type: Number,
  })
  duration!: number;

  static from(reservation: StudyroomReservationInfo): StudyroomReservationDto {
    return {
      id: reservation.id,
      name: reservation.roomName,
      date: reservation.date,
      startsAt: reservation.startsAt,
      duration: reservation.duration,
    };
  }
}

export class StudyroomReservationListDto {
  @ApiProperty({
    description: '스터디룸 예약 목록',
    type: [StudyroomReservationDto],
  })
  reservations: StudyroomReservationDto[];

  static from(
    reservations: StudyroomReservationInfo[],
  ): StudyroomReservationListDto {
    const sortByDate = (
      a: StudyroomReservationDto,
      b: StudyroomReservationDto,
    ) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    };

    return {
      reservations: reservations
        .map((reservation) => StudyroomReservationDto.from(reservation))
        .sort(sortByDate),
    };
  }
}
