import { Injectable } from '@nestjs/common';
import { StudyroomReservation as PrismaStudyroomReservation } from '@prisma/client';
import * as _ from 'lodash';
import { PrismaService } from 'src/common/services/prisma.service';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDateQuery } from './query/studyroomDateQuery.query';
import { ReservationResponse } from './types/reservationResponse.type';
import { Studyroom } from './types/studyroom.type';
import { StudyroomReservationInfo } from './types/studyroomReservationInfo.type';

@Injectable()
export class StudyroomRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private getSlotTime(time: string, idx: number): string {
    const hour = parseInt(time.split(':')[0]) + idx;
    return hour + ':00';
  }

  async getAllStudyrooms(query: StudyroomQuery): Promise<Studyroom[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        slots: {
          where: {
            date: query.date,
            startsAt: {
              gte: query.timeGte,
              lt: query.timeLt,
            },
          },
          select: {
            id: true,
            date: true,
            startsAt: true,
            isReserved: true,
            isClosed: true,
          },
          orderBy: {
            startsAt: 'asc',
          },
        },
      },
    });
    return studyrooms;
  }

  async getStudyroomById(
    id: number,
    query: StudyroomDateQuery,
  ): Promise<Studyroom> {
    const studyroom = await this.prismaService.studyroom.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        slots: {
          where: {
            date: query.date,
          },
          orderBy: {
            startsAt: 'asc',
          },
        },
      },
    });
    return studyroom;
  }

  async getReservationById(id: number): Promise<PrismaStudyroomReservation> {
    return await this.prismaService.studyroomReservation.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
    });
  }

  async getReservations(userId: string): Promise<StudyroomReservationInfo[]> {
    const today = new Date();

    const reservations = await this.prismaService.studyroomReservation.findMany(
      {
        where: {
          deletedAt: null,
          users: {
            some: {
              studentId: userId,
              deletedAt: null,
            },
          },
          slots: {
            some: {
              studyroomSlot: {
                date: {
                  gte: today,
                },
              },
            },
          },
        },
        select: {
          id: true,
          reserveReason: true,
          studyroom: {
            select: {
              name: true,
              isCinema: true,
            },
          },
          slots: {
            select: {
              studyroomSlot: {
                select: {
                  date: true,
                  startsAt: true,
                },
              },
            },
          },
          users: {
            where: {
              deletedAt: null,
            },
            select: {
              isLeader: true,
              user: {
                select: {
                  studentId: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    );

    return reservations;
  }

  async deleteReservations(
    userId: string,
    reservations: ReservationResponse[],
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const myReservationIds = await tx.userReservation.findMany({
        where: {
          studentId: userId,
          deletedAt: null,
          isLeader: true,
          studyroomReservation: {
            slots: {
              some: {
                studyroomSlot: {
                  date: {
                    gte: new Date(),
                  },
                },
              },
            },
          },
        },
        select: {
          reservationId: true,
        },
      });

      const newIds = reservations.map((reservation) => {
        return parseInt(reservation.booking_id);
      });

      const deletedReservationIds = _.flatMap(
        myReservationIds,
        'reservationId',
      ).filter((id) => {
        !newIds.includes(id);
      });

      await tx.userReservation.updateMany({
        where: {
          reservationId: {
            in: deletedReservationIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.studyroomReservation.updateMany({
        where: {
          id: {
            in: deletedReservationIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }

  async deleteReservation(
    reservationId: number,
    cancelReason: string,
  ): Promise<void> {
    await this.prismaService.studyroomReservation.update({
      where: {
        id: reservationId,
      },
      data: {
        deletedAt: new Date(),
        cancelReason: cancelReason,
        users: {
          updateMany: {
            where: {
              reservationId: reservationId,
            },
            data: {
              deletedAt: new Date(),
            },
          },
        },
      },
    });
  }

  async updateReservations(
    userId: string,
    newReservations: ReservationResponse[],
  ) {
    // 서버에서 받아온 정보와 DB에 저장된 정보를 비교해서 새로운 예약이 있으면 추가하고, 삭제된 예약이 있으면 삭제합니다
    await this.prismaService.$transaction(async (tx) => {
      const prevReservations = await tx.studyroomReservation.findMany({
        where: {
          deletedAt: null,
          users: {
            some: {
              studentId: userId,
              deletedAt: null,
            },
          },
          slots: {
            some: {
              studyroomSlot: {
                date: {
                  gte: new Date(),
                },
              },
            },
          },
        },
      });
      const prevIds = prevReservations.map((reservation) => reservation.id);
      const newIds = newReservations.map((reservation) =>
        parseInt(reservation.booking_id),
      );

      const deletedIds = _.difference(prevIds, newIds);
      const createdIds = _.difference(newIds, prevIds);

      const createdReservations = newReservations.filter((reservation) =>
        createdIds.includes(parseInt(reservation.booking_id)),
      );

      await tx.studyroomReservation.updateMany({
        where: {
          id: {
            in: deletedIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.userReservation.updateMany({
        where: {
          reservationId: {
            in: deletedIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.studyroomSlot.updateMany({
        where: {
          reservations: {
            some: {
              reservationId: {
                in: deletedIds,
              },
            },
          },
        },
        data: {
          isReserved: false,
        },
      });

      for (const reservation of createdReservations) {
        await tx.studyroomReservation.create({
          data: {
            id: parseInt(reservation.booking_id),
            pid: parseInt(reservation.ipid),
            studyroomId: parseInt(reservation.room_id),
            reserveReason: reservation.purpose,
            slots: {
              createMany: {
                data: Array.from(
                  { length: parseInt(reservation.duration) },
                  (_, index) => index,
                ).map((idx) => ({
                  slotId: `${reservation.room_id}_${reservation.date}_${this.getSlotTime(reservation.starts_at, idx)}`,
                })),
              },
            },
            users: {
              createMany: {
                data: [
                  ...reservation.users.map((user) => user.student_id),
                  userId,
                ].map((id) => ({
                  studentId: id,
                  isLeader: id === userId,
                })),
              },
            },
          },
        });
      }
    });
  }
}
