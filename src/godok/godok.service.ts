import { Injectable } from '@nestjs/common';
import { GodokRepository } from './godok.repository';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawGodokSlot } from './types/rawGodokSlot';

@Injectable()
export class GodokService {
  constructor(
    private readonly godokRepository: GodokRepository,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  @Cron('*/2 * * * * *')
  async handleCron() {
    if (this.configService.get<string>('NODE_ENV') !== 'prod') {
      return;
    }

    console.log('[godok] crawler start @', new Date());
    const res = await this.axiosService.get(
      this.configService.get<string>('GET_GODOK_CALENDAR_URL'),
    );

    console.log('[godok] crawler end @', new Date());
    const rawGodokSlots = JSON.parse(res.data) as RawGodokSlot;

    for (const rawGodokSlot of rawGodokSlots) {
      for (const slot of rawGodokSlot.slots) {
        await this.prismaService.godokSlot.upsert({
          where: {
            dataId: slot.data_id,
          },
          create: {
            dataId: slot.data_id,
            date: new Date(slot.date),
            time: slot.time,
            availableSeats: parseInt(slot.available_seats),
            totalSeats: parseInt(slot.total_seats),
          },
          update: {
            availableSeats: parseInt(slot.available_seats),
          },
        });
      }
    }
  }

  async getGodokCalendar(): Promise<GodokSlotListDto> {
    const slots = await this.godokRepository.getGodokCalendar();
    return GodokSlotListDto.from(slots);
  }
}
