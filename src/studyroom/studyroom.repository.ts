import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { StudyroomQuery } from './query/studyroom.query';
import { Studyroom } from './types/studyroom.type';
import { ReservationResponse } from './types/reservationResponse.type';
import { StudyroomReservation } from './types/studyroomReservation.type';

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
    nextWeek.setDate(today.getDate() + 7);

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
        deletedAt: null,
      },
    });

    for (const reservation of userReservations) {
      const infos = await this.prismaService.studyroomReservation.findUnique({
        where: {
          id: reservation.reservationId,
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

      const users = await Promise.all(
        infos.users.map(async (user) => {
          return this.prismaService.user.findUnique({
            where: {
              studentId: user.studentId,
            },
            select: {
              studentId: true,
              name: true,
            },
          });
        }),
      );

      if (slot) {
        const studyroomName = await this.prismaService.studyroom.findUnique({
          where: { id: slot.studyroomId },
          select: { name: true },
        });

        reservations.push({
          id: reservation.id,
          name: studyroomName.name,
          date: slot.date,
          startsAt: slot.startsAt,
          duration: infos.slots.length,
          isLeader: reservation.isLeader,
          reason: infos.reserveReason,
          users: users,
        });
      } else {
        throw new NotFoundException('해당 slot을 찾을 수 없습니다.');
      }
    }

    const sortedReservations = reservations.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return sortedReservations;
  }

  async updateReservations(
    studentId: string,
    reservations: ReservationResponse,
  ) {
    for (const reservation of reservations.result) {
      const existingReservation =
        await this.prismaService.studyroomReservation.findUnique({
          where: { id: parseInt(reservation.booking_id) },
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

        const userIds = reservation.users.map((user) => user.student_id);
        userIds.push(studentId);
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
                data: userIds.map((userId) => ({
                  studentId: userId,
                  isLeader: studentId === userId,
                })),
              },
            },
          },
        });
      }
    }
  }
}
