import { Injectable } from '@nestjs/common';
import {
  Prisma,
  StudyroomReservation as PrismaStudyroomReservation,
} from '@prisma/client';
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

  private getSlotTime(time: string, idx: number): string {
    const hour = parseInt(time.split(':')[0]) + idx;
    return hour + ':00';
  }

  private async createReservations(
    userId: string,
    reservations: ReservationResponse[],
    tx: Prisma.TransactionClient,
  ) {
    for (const reservation of reservations) {
      const found = await tx.studyroomReservation.findUnique({
        where: { id: parseInt(reservation.booking_id) },
      });

      if (!found) {
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
    }
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
    reservations: ReservationResponse[],
  ): Promise<void> {
    await this.prismaService.$transaction(
      async (tx: Prisma.TransactionClient) => [
        await this.createReservations(userId, reservations, tx),
      ],
    );

    await this.deleteReservations(userId, reservations);
  }
}
