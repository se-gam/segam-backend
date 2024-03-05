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
            isClosed: false,
            isReserved: false,
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

  async isReservationLeader(
    reservationId: number,
    userId: string,
  ): Promise<boolean> {
    const reservation =
      await this.prismaService.studyroomReservation.findUnique({
        where: {
          id: reservationId,
        },
        select: {
          users: {
            where: {
              studentId: userId,
            },
          },
        },
      });
    return reservation.users[0].isLeader;
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
    const prevReservations =
      await this.prismaService.studyroomReservation.findMany({
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

    const existingIds = _.intersection(prevIds, newIds);
    const deletedIds = _.difference(prevIds, existingIds);
    const createdIds = _.difference(newIds, existingIds);

    const createdReservations = newReservations.filter((reservation) =>
      createdIds.includes(parseInt(reservation.booking_id)),
    );

    // 사라진 예약들 삭제
    await this.prismaService.studyroomReservation.updateMany({
      where: {
        id: {
          in: deletedIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
    await this.prismaService.userReservation.updateMany({
      where: {
        reservationId: {
          in: deletedIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // 슬롯 다시 열어주기
    await this.prismaService.studyroomSlot.updateMany({
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

    // 새로운 예약들 추가
    for (const reservation of createdReservations) {
      await this.prismaService.studyroomReservation.create({
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
