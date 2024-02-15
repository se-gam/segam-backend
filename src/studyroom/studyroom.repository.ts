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

  async getReservations(userId: string): Promise<StudyroomReservation[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservations = await this.prismaService.studyroomReservation.findMany(
      {
        where: {
          users: {
            some: {
              studentId: userId,
            },
          },
        },
        select: {
          id: true,
          reserveReason: true,
          studyroom: {
            select: {
              name: true,
            },
          },
          slots: {
            where: {
              studyroomSlot: {
                date: {
                  gte: today,
                },
              },
            },
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

    return reservations.map((reservation) => {
      return StudyroomReservation.from(userId, reservation);
    });
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
            studyroomId: parseInt(reservation.room_id),
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
