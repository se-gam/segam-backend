import { UserDto } from 'src/user/dto/user.dto';
import { StudyroomReservation } from '../types/studyroomReservation.type';
import { ApiProperty } from '@nestjs/swagger';

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
  isCinema: boolean;
  @ApiProperty({
    description: '예약 이유',
    type: String,
  })
  reason!: string;
  @ApiProperty({
    description: '사용자들 정보',
    type: [UserDto],
  })
  users!: UserDto[];

  static from(reservation: StudyroomReservation): StudyroomReservationDto {
    return {
      id: reservation.id,
      name: reservation.name,
      date: reservation.date,
      startsAt: reservation.startsAt,
      duration: reservation.duration,
      isLeader: reservation.isLeader,
      isCinema: reservation.isCinema,
      reason: reservation.reason,
      users: reservation.users,
    };
  }
}

export class StudyroomReservatoinListDto {
  @ApiProperty({
    description: '스터디룸 예약 목록',
    type: [StudyroomReservation],
  })
  reservations: StudyroomReservation[];

  static from(
    reservations: StudyroomReservation[],
  ): StudyroomReservatoinListDto {
    return {
      reservations: reservations
        .map((reservation) => {
          return StudyroomReservationDto.from(reservation);
        })
        .sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }),
    };
  }
}
