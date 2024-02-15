import { User } from 'src/user/type/user.type';

export class StudyroomReservation {
  id: number;
  name: string;
  date: Date;
  startsAt: number;
  duration: number;
  isLeader: boolean;
  reason: string;
  users: User[];

  static from(
    studentId: string,
    reservation: RawStudyroomReservation,
  ): StudyroomReservation {
    return {
      id: reservation.id,
      name: reservation.studyroom.name,
      date: reservation.slots[0].studyroomSlot.date,
      startsAt: reservation.slots[0].studyroomSlot.startsAt,
      duration: reservation.slots.length,
      isLeader: reservation.users.find((user) => {
        user.user.studentId == studentId;
      }).isLeader,
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
