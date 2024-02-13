import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { StudyroomQuery } from './query/studyroom.query';
import { Studyroom } from './types/studyroom.type';
import { ReservationResponse } from './types/reservationResponse.type';
import { StudyroomReservation } from './types/studyroomReservation.type';
import { UserReservation } from '@prisma/client';

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
      },
      include: {
        slots: {
          where: {
            date: query.date,
            startsAt: {
              gte: query.timeGte,
              lt: query.timeLte,
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
    nextWeek.setDate(today.getDate() + 6);

    const studyroom = await this.prismaService.studyroom.findUnique({
      where: {
        id: id,
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

  async getReservations(userId: string): Promise<StudyroomReservation[]> {
    const reservations = [];
    const userReservations = await this.prismaService.userReservation.findMany({
      where: {
        studentId: userId,
      },
    });

    for (const reservation of userReservations) {
      const infos = await this.prismaService.studyroomReservation.findUnique({
        where: {
          id: reservation.id,
        },
        select: {
          reserveReason: true,
          slots: true,
          users: true,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const slot = await this.prismaService.studyroomSlot.findUnique({
        where: {
          id: infos.slots[0].slotId,
          date: {
            gte: today,
          },
        },
        select: {
          studyroomId: true,
          date: true,
          startsAt: true,
        },
      });

      const users = infos.users.map(async (user) => {
        await this.prismaService.user.findFirst({
          where: {
            studentId: user.studentId,
          },
          select: {
            studentId: true,
            name: true,
          },
        });
      });

      if (slot) {
        reservations.push({
          id: reservation.id,
          name: await this.prismaService.studyroom.findFirst({
            where: { id: slot.studyroomId },
          }),
          date: slot.date,
          startsAt: slot.startsAt,
          duration: infos.slots.length,
          isLeader: reservation.isLeader,
          reason: infos.reserveReason,
          users: users,
        });
      }
    }
    return reservations;
  }

  async updateReservations(userId: string, resrevations: ReservationResponse) {
    resrevations.result.map(async (reservation) => {
      const existingReservation =
        await this.prismaService.studyroomReservation.findUnique({
          where: { pid: parseInt(reservation.ipid) },
        });
      if (!existingReservation) {
        const slotIds: string[] = [];
        const duration = parseInt(reservation.duration.match(/\d+/)[0]);
        for (let i = 0; i < duration; i++) {
          const foundSlot = await this.prismaService.studyroomSlot.findUnique({
            where: {
              studyroomId_date_startsAt: {
                studyroomId: parseInt(reservation.room_id),
                date: new Date(reservation.date).toISOString(),
                startsAt: parseInt(reservation.starts_at.split(':')[0]) + i,
              },
            },
          });
          if (foundSlot) {
            await this.prismaService.studyroomSlot.update({
              where: { id: foundSlot.id },
              data: { isReserved: true },
            });
            slotIds.push(foundSlot.id);
          } else {
            throw new NotFoundException('해당 slot을 찾을 수 없습니다.');
          }
        }

        await this.prismaService.studyroomReservation.create({
          data: {
            id: parseInt(reservation.booking_id),
            pid: parseInt(reservation.ipid),
            reserveReason: reservation.purpose,
            slots: {
              createMany: {
                data: slotIds.map((slotId) => ({
                  slotId: slotId,
                })),
              },
            },
            users: {
              createMany: {
                data: reservation.users.map((user) => ({
                  studentId: user.student_id,
                  isLeader: userId === user.student_id,
                })),
              },
            },
          },
        });
      }
    });
  }
}
