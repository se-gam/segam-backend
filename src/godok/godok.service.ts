import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { GodokRepository } from './godok.repository';
import { RawGodokSlot } from './types/rawGodokSlot.type';

@Injectable()
export class GodokService {
  constructor(
    private readonly godokRepository: GodokRepository,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  @Cron('*/7 * * * * *')
  async handleCron() {
    console.log('[godok] crawler start @', new Date());
    const res = await this.axiosService.get(
      this.configService.get<string>('GET_GODOK_CALENDAR_URL'),
    );

    console.log('[godok] crawler end @', new Date());
    const rawGodokSlots = JSON.parse(res.data) as RawGodokSlot;

    for (const slot of rawGodokSlots) {
      await this.prismaService.godokSlot.upsert({
        where: {
          slotId: slot.data_id,
        },
        create: {
          slotId: slot.data_id,
          startsAt: new Date(slot.date_time),
          availableSeats: slot.available_seats,
          totalSeats: slot.total_seats,
        },
        update: {
          availableSeats: slot.available_seats,
        },
      });
    }
  }

  async getGodokCalendar(): Promise<GodokSlotListDto> {
    const slots = await this.godokRepository.getGodokCalendar();
    return GodokSlotListDto.from(slots);
  }
}
