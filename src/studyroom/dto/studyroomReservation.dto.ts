import { UserDto, UserDto2 } from 'src/user/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { StudyroomReservationInfo } from '../types/studyroomReservationInfo.type';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
    type: [UserDto2],
  })
  users!: UserDto2[];

  static from(
    userId: string,
    reservation: StudyroomReservationInfo,
  ): StudyroomReservationDto {
    if (reservation.slots.length < 1) {
      throw new ForbiddenException('slot이 존재하지 않습니다.');
    }
    const user = reservation.users.find((user) => {
      return user.user.studentId === userId;
    });
    if (!user) {
      throw new NotFoundException('user를 찾지 못했습니다.');
    }
    return {
      id: reservation.id,
      name: reservation.studyroom.name,
      date: reservation.slots[0].studyroomSlot.date,
      startsAt: reservation.slots[0].studyroomSlot.startsAt,
      duration: reservation.slots.length,
      isLeader: user.isLeader,
      isCinema: reservation.studyroom.isCinema,
      reason: reservation.reserveReason,
      users: reservation.users.map((user) => {
        return user.user;
      }),
    };
  }
}

export class StudyroomReservatoinListDto {
  @ApiProperty({
    description: '스터디룸 예약 목록',
    type: [StudyroomReservationDto],
  })
  reservations: StudyroomReservationDto[];

  static from(
    userId: string,
    reservations: StudyroomReservationInfo[],
  ): StudyroomReservatoinListDto {
    const sortByDate = (
      a: StudyroomReservationDto,
      b: StudyroomReservationDto,
    ) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    };

    return {
      reservations: reservations
        .map((reservation) => {
          return StudyroomReservationDto.from(userId, reservation);
        })
        .sort(sortByDate),
    };
  }
}
