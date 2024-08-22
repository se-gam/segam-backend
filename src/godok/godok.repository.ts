import { Injectable } from '@nestjs/common';
import { GodokSlot } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class GodokRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getGodokCalendar(): Promise<GodokSlot[]> {
    const today = new Date();

    const slots = await this.prismaService.godokSlot.findMany({
      where: {
        deletedAt: null,
        date: {
          gt: today,
        },
      },
    });

    return slots;
  }
}
