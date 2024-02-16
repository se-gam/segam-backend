import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { NOTFOUND } from 'dns';
import { User } from 'src/user/type/user.type';

export class StudyroomReservation {
  id: number;
  name: string;
  date: Date;
  startsAt: number;
  duration: number;
  isLeader: boolean;
  isCinema: boolean;
  reason: string;
  users: User[];

  static from(
    studentId: string,
    reservation: RawStudyroomReservation,
  ): StudyroomReservation {
    if (reservation.slots.length < 1) {
      throw new ForbiddenException('slot이 존재하지 않습니다.');
    }
    console.log(studentId);
    console.log(reservation.users);
    const user = reservation.users.find((user) => {
      return user.user.studentId === studentId;
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

export type RawStudyroomReservation = {
  users: {
    user: {
      name: string;
      studentId: string;
    };
    isLeader: boolean;
  }[];
  studyroom: {
    name: string;
    isCinema: boolean;
  };
  id: number;
  slots: {
    studyroomSlot: {
      date: Date;
      startsAt: number;
    };
  }[];
  reserveReason: string;
};
