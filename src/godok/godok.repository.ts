import { Injectable } from '@nestjs/common';
import { GodokSlot } from '@prisma/client';
import * as _ from 'lodash';
import { PrismaService } from 'src/common/services/prisma.service';
import { GodokReservationResponse } from './types/godokReservationResponse.type';
import { GodokBook } from './types/godokBook.type';
import { GodokReservationInfo } from './types/godokReservationInfo.type';

@Injectable()
export class GodokRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getGodokCalendar(): Promise<GodokSlot[]> {
    const today = new Date();

    const slots = await this.prismaService.godokSlot.findMany({
      where: {
        deletedAt: null,
        startsAt: {
          gt: today,
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return slots;
  }

  async getBookIdsByNames(names: string[]): Promise<Map<string, number>> {
    const books = await this.prismaService.book.findMany({
      where: {
        title: {
          in: names,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    return new Map(books.map((book) => [book.title, book.id]));
  }

  async updateUserReservation(
    userId: string,
    newReservations: GodokReservationResponse[],
  ) {
    // 이전 예약 id 탐색
    const prevIds = await this.getReservationIds(userId);
    const newIds = (newReservations || []).map(
      (reservation) => reservation.reserve_id,
    );

    const existingIds = _.intersection(prevIds, newIds);
    const deletedIds = _.difference(prevIds, existingIds);
    const createdReservations = newReservations.filter((reservation) =>
      _.difference(newIds, existingIds).includes(reservation.reserve_id),
    );

    // 사라진 예약 삭제
    await this.prismaService.godokReservation.updateMany({
      where: {
        reservationId: {
          in: deletedIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // bookId 탐색
    const bookNames = createdReservations.map(
      (reservation) => reservation.book_name,
    );
    const bookData = await this.getBookIdsByNames(bookNames);

    // 새로운 예약 생성
    await this.prismaService.godokReservation.createMany({
      data: [
        ...createdReservations.map((reservation) => {
          return {
            reservationId: reservation.reserve_id,
            studentId: userId,
            bookId: bookData.get(reservation.book_name),
            startsAt: new Date(reservation.date_time),
          };
        }),
      ],
      skipDuplicates: true,
    });
  }

  async getReservationIds(userId: string): Promise<string[]> {
    const today = new Date();

    const reservationIds = await this.prismaService.godokReservation.findMany({
      where: {
        deletedAt: null,
        studentId: userId,
        startsAt: {
          gte: today,
        },
      },
      select: {
        reservationId: true,
      },
    });

    return _.flatMap(reservationIds, 'reservationId');
  }

  async getReservations(userId: string): Promise<GodokReservationInfo[]> {
    const today = new Date();

    const reservations = await this.prismaService.godokReservation.findMany({
      where: {
        deletedAt: null,
        studentId: userId,
        startsAt: {
          gte: today,
        },
      },
      select: {
        reservationId: true,
        studentId: true,
        bookId: true,
        book: {
          select: {
            bookCategory: {
              select: {
                id: true,
              },
            },
            title: true,
          },
        },
        startsAt: true,
      },
    });

    return reservations;
  }

  async getGodokBooks(): Promise<GodokBook[]> {
    return this.prismaService.book.findMany({
      select: {
        id: true,
        title: true,
        bookCategoryId: true,
        bookCategory: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
