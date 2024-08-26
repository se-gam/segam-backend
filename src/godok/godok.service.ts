import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { GodokRepository } from './godok.repository';
import { RawGodokSlot } from './types/rawGodokSlot.type';
import { GodokReservePayload } from './payload/godokReserve.payload';
import { ResultResponse } from 'src/studyroom/types/resultResponse.type';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class GodokService {
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
      throw new BadRequestException(response.error);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.error);
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

    await this.godokRepository.updateUserReservation(userId, response.result);
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
}
