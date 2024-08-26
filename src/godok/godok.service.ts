import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { GodokRepository } from './godok.repository';

import { Cron } from '@nestjs/schedule';
import * as _ from 'lodash';
import { GodokBookDto } from './dto/godok-book.dto';
import { RawGodokSlot } from './types/rawGodokSlot.type';

@Injectable()
export class GodokService {
  private bookListUrl = 'http://classic.sejong.ac.kr/seletTermBookList.json';
  private latestTermId = 'TERM-00571'; // 2024-2학기
  private bookAreas = [
    {
      id: 1000,
      name: '서양의 역사와 사상',
      targetCount: 4,
    },
    {
      id: 2000,
      name: '동양의 역사와 사상',
      targetCount: 2,
    },
    {
      id: 3000,
      name: '동서양의 문학',
      targetCount: 3,
    },
    {
      id: 4000,
      name: '과학 사상',
      targetCount: 1,
    },
  ];

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

  private async fetchGodokBooks(bkAreaCode: number) {
    const formData = new FormData();
    formData.append('opTermId', this.latestTermId);
    formData.append('bkAreaCode', bkAreaCode.toString());

    const response = await this.axiosService.post(this.bookListUrl, formData);

    return JSON.parse(response.data).results as {
      bkAreaCode: number;
      bkAreaName: string;
      bkCode: number;
      bkName: string;
      appCount: number;
      bkStatus: string;
    };
  }

  async updateGodokBooks() {
    const rawBooks = _.flatten(
      await Promise.all([
        this.fetchGodokBooks(1000),
        this.fetchGodokBooks(2000),
        this.fetchGodokBooks(3000),
        this.fetchGodokBooks(4000),
      ]),
    );

    await this.prismaService.bookCategory.createMany({
      data: this.bookAreas,
      skipDuplicates: true,
    });

    await this.prismaService.book.createMany({
      data: rawBooks.map((book) => {
        return {
          id: book.bkCode,
          title: book.bkName,
          bookCategoryId: book.bkAreaCode,
        };
      }),
      skipDuplicates: true,
    });
  }

  async getGodokBooks(): Promise<GodokBookDto[]> {
    const books = await this.godokRepository.getGodokBooks();

    return GodokBookDto.from(books);
  }

  async getGodokCalendar(): Promise<GodokSlotListDto> {
    const slots = await this.godokRepository.getGodokCalendar();
    return GodokSlotListDto.from(slots);
  }
}
