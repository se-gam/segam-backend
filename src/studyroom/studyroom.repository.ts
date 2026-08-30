import { Injectable, NotFoundException } from '@nestjs/common';
import { StudyroomReservation as PrismaStudyroomReservation } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { StudyroomUpdatePayload } from './payload/studyroomUpdate.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDateQuery } from './query/studyroomDateQuery.query';
import { ReservationResponse } from './types/reservationResponse.type';
import { Studyroom } from './types/studyroom.type';
import { StudyroomInfo } from './types/studyroomInfo.type';
import { StudyroomReservationInfo } from './types/studyroomReservationInfo.type';

@Injectable()
export class StudyroomRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private getSlotTime(time: string, idx: number): string {
    const hour = parseInt(time.split(':')[0]) + idx;
    return hour + ':00';
  }

  async getAllStudyroomInfo(): Promise<StudyroomInfo[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        location: true,
        minUsers: true,
        maxUsers: true,
        isCinema: true,
        operatingHours: true,
        tags: true,
        isActive: true,
      },
    });

    const lastUpdatedSlots = await this.prismaService.studyroomSlot.groupBy({
      by: ['studyroomId'],
      _max: {
        updatedAt: true,
      },
      where: {
        studyroomId: {
          in: studyrooms.map((studyroom) => studyroom.id),
        },
      },
    });

    return studyrooms.map((studyroom) => {
      return {
        ...studyroom,
        lastUpdatedAt: lastUpdatedSlots.find(
          (slot) => slot.studyroomId === studyroom.id,
        )?._max.updatedAt,
      };
    });
  }

  async getStudyroomInfoById(id: number): Promise<StudyroomInfo> {
    const studyroomInfo = await this.prismaService.studyroom.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        location: true,
        minUsers: true,
        maxUsers: true,
        isCinema: true,
        operatingHours: true,
        tags: true,
        isActive: true,
      },
    });

    if (!studyroomInfo) {
      throw new NotFoundException('스터디룸이 존재하지 않습니다.');
    }

    const lastUpdatedSlot = await this.prismaService.studyroomSlot.findFirst({
      where: {
        studyroomId: id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        updatedAt: true,
      },
    });

    return {
      ...studyroomInfo,
      lastUpdatedAt: lastUpdatedSlot.updatedAt,
    };
  }

  async getAllStudyroomIds(): Promise<number[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    return studyrooms.map((studyroom) => studyroom.id);
  }

  async getStudyroomIdByName(roomName: string): Promise<number> {
    const studyroomId = await this.prismaService.studyroom.findFirst({
      where: {
        name: roomName,
      },
      select: {
        id: true,
      },
    });
    return studyroomId.id;
  }

  async getAllStudyroomNames(): Promise<string[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        name: true,
      },
    });
    return studyrooms.map((studyroom) => studyroom.name);
  }

  async getAllStudyrooms(query: StudyroomQuery): Promise<Studyroom[]> {
    const studyrooms = await this.prismaService.studyroom.findMany({
      where: {
        isActive: true,
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
    today.setHours(0, 0, 0, 0);

    const reservations = await this.prismaService.studyroomReservation.findMany(
      {
        where: {
          visitorId: userId,
          deletedAt: null,
          date: {
            gte: today,
          },
        },
        select: {
          id: true,
          visitorId: true,
          bookingId: true,
          roomName: true,
          date: true,
          startsAt: true,
          duration: true,
          user: {
            select: {
              studentId: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      },
    );

    return reservations;
  }

  async deleteReservation(reservationId: number): Promise<void> {
    await this.prismaService.studyroomReservation.update({
      where: {
        id: reservationId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private getReservationKey(
    roomName: string,
    date: string,
    startsAt: string,
  ): string {
    return `${roomName}_${date}_${startsAt}`;
  }

  async updateReservations(
    userId: string,
    newReservations: ReservationResponse[],
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prevReservations =
      await this.prismaService.studyroomReservation.findMany({
        where: {
          visitorId: userId,
          deletedAt: null,
          date: {
            gte: today,
          },
        },
      });

    const prevKeys = new Map(
      prevReservations.map((r) => [
        this.getReservationKey(
          r.roomName,
          r.date.toISOString().split('T')[0].replace(/-/g, '.'),
          r.startsAt,
        ),
        r,
      ]),
    );

    const newKeys = new Set(
      newReservations.map((r) =>
        this.getReservationKey(r.room_name, r.date, r.starts_at),
      ),
    );

    const deletedReservations = prevReservations.filter(
      (r) =>
        !newKeys.has(
          this.getReservationKey(
            r.roomName,
            r.date.toISOString().split('T')[0].replace(/-/g, '.'),
            r.startsAt,
          ),
        ),
    );

    if (deletedReservations.length > 0) {
      await this.prismaService.studyroomReservation.updateMany({
        where: {
          id: {
            in: deletedReservations.map((r) => r.id),
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    const createdReservations = newReservations.filter(
      (r) =>
        !prevKeys.has(this.getReservationKey(r.room_name, r.date, r.starts_at)),
    );

    for (const reservation of createdReservations) {
      const [year, month, day] = reservation.date.split('.');
      const dateObj = new Date(`${year}-${month}-${day}`);

      await this.prismaService.studyroomReservation.create({
        data: {
          visitorId: userId,
          bookingId: reservation.booking_id,
          ipid: reservation.ipid,
          roomName: reservation.room_name,
          date: dateObj,
          startsAt: reservation.starts_at,
          duration: parseInt(reservation.duration),
        },
      });
    }

    for (const reservation of newReservations) {
      const key = this.getReservationKey(
        reservation.room_name,
        reservation.date,
        reservation.starts_at,
      );
      const existing = prevKeys.get(key);

      if (existing && reservation.booking_id && !existing.bookingId) {
        await this.prismaService.studyroomReservation.update({
          where: { id: existing.id },
          data: {
            bookingId: reservation.booking_id,
            ipid: reservation.ipid,
          },
        });
      }
    }
  }

  async updateStudyroom(
    id: number,
    payload: StudyroomUpdatePayload,
  ): Promise<void> {
    await this.prismaService.studyroom.update({
      where: {
        id,
      },
      data: {
        isActive: payload.isActive,
      },
    });
  }
}
