import { UserDto } from 'src/user/dto/user.dto';
import { StudyroomReservation } from '../types/studyroomReservation.type';

export class StudyroomReservationDto {
  id!: number;
  name!: string;
  date!: Date;
  startsAt!: number;
  duration!: number;
  isLeader!: boolean;
  isCinema: boolean;
  reason!: string;
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
