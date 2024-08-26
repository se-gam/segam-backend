import { Injectable } from '@nestjs/common';
import { GodokSlot } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { GodokBook } from './types/godokBook.type';

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
