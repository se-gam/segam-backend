import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { StudyroomQuery } from './query/studyroom.query';
import { Studyroom } from './types/studyroom.type';
import { ReservationResponse } from './types/reservationResponse.type';
import { Prisma } from '@prisma/client';
import * as _ from 'lodash';
import { StudyroomReservation as PrismaStudyroomReservation } from '@prisma/client';
import { StudyroomReservationInfo } from './types/studyroomReservationInfo.type';

@Injectable()
export class StudyroomRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async getAllStudyrooms(query: StudyroomQuery): Promise<Studyroom[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        minUsers: {
          lte: query.userCount,
        },
        maxUsers: {
          gte: query.userCount,
        },
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
        },
      },
    });
    return studyrooms;
  }

  async getStudyroomById(id: number): Promise<Studyroom> {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const studyroom = await this.prismaService.studyroom.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      include: {
        slots: {
          where: {
            date: {
              gte: today,
              lte: nextWeek,
            },
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
    reservations: ReservationResponse,
    tx: Prisma.TransactionClient,
  ) {
    for (const reservation of reservations.result) {
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

  async deleteReservations(userId: string, reservations: ReservationResponse) {
    const today = new Date();

    const myReservationIds = await this.prismaService.userReservation.findMany({
      where: {
        studentId: userId,
        deletedAt: null,
        isLeader: true,
        studyroomReservation: {
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
      },
      select: {
        reservationId: true,
      },
    });

    const deletedReservationIds = reservations.result
      .map((reservation) => {
        return parseInt(reservation.booking_id);
      })
      .filter(
        (reservationId) =>
          !_.flatMap(myReservationIds, 'reservationId').includes(reservationId),
      );

    await this.prismaService.userReservation.updateMany({
      where: {
        reservationId: {
          in: deletedReservationIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.prismaService.studyroomReservation.updateMany({
      where: {
        id: {
          in: deletedReservationIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async deleteReservation(reservationId: number, cancelReason: string) {
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

  async updateReservations(userId: string, reservations: ReservationResponse) {
    await this.prismaService.$transaction(
      async (tx: Prisma.TransactionClient) => [
        await this.createReservations(userId, reservations, tx),
      ],
    );

    await this.deleteReservations(userId, reservations);
  }
}
