import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as _ from 'lodash';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { ResultResponse } from 'src/studyroom/types/resultResponse.type';
import { UserRepository } from 'src/user/user.repository';
import { GodokBookDto } from './dto/godok-book.dto';
import { GodokReservationDto } from './dto/godok-reservation.dto';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { GodokStatusDto } from './dto/godok-status.dto';
import { GodokRepository } from './godok.repository';
import { GodokReservePayload } from './payload/godokReserve.payload';
import { GodokStatusInfo } from './types/godokStatusInfo.type';
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
    private readonly userRepository: UserRepository,
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
      const startsAt = new Date(slot.date_time);
      try {
        await this.prismaService.godokSlot.upsert({
          where: {
            startsAt,
          },
          create: {
            slotId: slot.data_id,
            startsAt,
            availableSeats: slot.available_seats,
            totalSeats: slot.total_seats,
          },
          update: {
            slotId: slot.data_id,
            availableSeats: slot.available_seats,
            totalSeats: slot.total_seats,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async createGodokReservaion(
    userId: string,
    payload: GodokReservePayload,
  ): Promise<ResultResponse> {
    const res = await this.axiosService.post(
      this.configService.get<string>('CREATE_GODOK_RESERVATION_URL'),
      JSON.stringify({
        student_id: userId,
        password: payload.password,
        shInfoId: payload.godokSlotId,
        bkCode: payload.bookCode,
        bkAreaCode: payload.bookAreaCode,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const response = JSON.parse(res.data);
    if (res.status === 400) {
      throw new BadRequestException(response.message);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.message);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return response;
  }

  async updateUserGodokReservation(userId: string, password: string) {
    const user = await this.userRepository.getUserByStudentId(userId);

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    const res = await this.axiosService.post(
      this.configService.get<string>('GET_USER_GODOK_RESERVATIONS_URL'),
      JSON.stringify({ student_id: userId, password: password }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    const response = JSON.parse(res.data);

    if (res.status === 400) {
      throw new BadRequestException(response.error);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.error);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    await this.godokRepository.updateUserReservation(
      userId,
      response.reservations,
    );
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

  async reserveGodok(
    userId: string,
    payload: GodokReservePayload,
  ): Promise<void> {
    await this.createGodokReservaion(userId, payload);
    await this.updateUserGodokReservation(userId, payload.password);
  }

  async cancelReservation(
    userId: string,
    payload: PasswordPayload,
    reservationId: string,
  ): Promise<void> {
    const res = await this.axiosService.post(
      this.configService.get<string>('CANCEL_GODOK_RESERVATION_URL'),
      JSON.stringify({
        student_id: userId,
        password: payload.password,
        opAppInfoId: reservationId,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    const response = JSON.parse(res.data);
    if (res.status === 400) {
      throw new BadRequestException(response.error);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.error);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    await this.godokRepository.deleteReservation(reservationId);
  }

  async getUserReservations(
    userId: string,
    payload: PasswordPayload,
  ): Promise<GodokReservationDto[]> {
    await this.updateUserGodokReservation(userId, payload.password);
    const reservations = await this.godokRepository.getReservations(userId);
    return reservations.map((reservation) =>
      GodokReservationDto.from(reservation),
    );
  }

  async getUserGodokStatus(
    userId: string,
    payload: PasswordPayload,
  ): Promise<GodokStatusInfo> {
    const res = await this.axiosService.post(
      this.configService.get<string>('GET_USER_GODOK_STATUS_URL'),
      JSON.stringify({
        student_id: userId,
        password: payload.password,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    const response = JSON.parse(res.data);
    if (res.status === 400) {
      throw new BadRequestException(response.error);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.error);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return response.reservations;
  }

  async getUserStatus(
    userId: string,
    payload: PasswordPayload,
  ): Promise<GodokStatusDto> {
    const statusInfo = await this.getUserGodokStatus(userId, payload);
    await this.godokRepository.updateUserStatus(userId, statusInfo);
    const status = await this.godokRepository.getUserStatus(userId);
    return GodokStatusDto.from(status);
  }
}
