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
    type: Number,
  })
  startsAt!: number;

  @ApiProperty({
    description: '이용 시간',
    type: Number,
  })
  duration!: number;

  @ApiProperty({
    description: '방장 여부',
    type: Boolean,
  })
  isLeader!: boolean;

  @ApiProperty({
    description: '스터디룸 유형',
    type: Boolean,
  })
  isCinema!: boolean;

  @ApiProperty({
    description: '예약 이유',
    type: String,
  })
  reason!: string;

  @ApiProperty({
    description: '사용자들 정보',
    type: [Object],
  })
  users!: { studentId: string; name: string }[];

  static from(reservation: StudyroomReservationInfo): StudyroomReservationDto {
    return {
      id: reservation.id,
      name: reservation.roomName,
      date: reservation.date,
      startsAt: Number(reservation.startsAt.split(':')[0]),
      duration: reservation.duration,
      isLeader: true,
      isCinema: reservation.roomName.includes('시네마'),
      reason: '',
      users: [reservation.user],
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
