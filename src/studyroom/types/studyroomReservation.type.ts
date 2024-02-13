import { User } from 'src/user/type/user.type';
import { ReservationResponse } from './reservationResponse.type';

export type StudyroomReservation = {
  id: number;
  name: string;
  date: Date;
  startsAt: number;
  duration: number;
  isLeader: boolean;
  reason: string;
  users: User[];
};
