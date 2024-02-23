import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserInfoPayload } from 'src/user/payload/UserInfoPayload.payload';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomReservatoinListDto } from './dto/studyroomReservation.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { ReservationService } from './reservation.service';
import { StudyroomRepository } from './studyroom.repository';

@Injectable()
export class StudyroomService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly studyroomRepository: StudyroomRepository,
    private readonly reservationService: ReservationService,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
  ) {}

  private getSlotTime(time: string) {
    if (time.indexOf(':') === -1) {
      return -1;
    }
    return parseInt(time.split(':')[0]);
  }

  @Cron('*/10 * * * * *')
  async handleCron() {
    const res = await this.axiosService.get(
      this.configService.get<string>('CRAWLER_API_ROOT') + '/calendar',
    );
    const rawStudyrooms = JSON.parse(res.data);
    const studyrooms = rawStudyrooms.flatMap((studyroom) =>
      studyroom.slots.map((slot) => ({ room_id: studyroom.room_id, slot })),
    );

    studyrooms.forEach(async (rawStudyRoom) => {
      const slotId = `${rawStudyRoom.room_id}_${rawStudyRoom.slot.date}_${rawStudyRoom.slot.time}`;
      await this.prismaService.$transaction([
        this.prismaService.studyroomSlot.upsert({
          where: {
            id: slotId,
          },
          update: {
            isReserved: rawStudyRoom.slot.is_reserved,
            isClosed: rawStudyRoom.slot.is_closed,
          },
          create: {
            id: slotId,
            studyroomId: parseInt(rawStudyRoom.room_id),
            date: new Date(rawStudyRoom.slot.date),
            startsAt: this.getSlotTime(rawStudyRoom.slot.time),
            isReserved: rawStudyRoom.slot.is_reserved,
            isClosed: rawStudyRoom.slot.is_closed,
          },
        }),
      ]);
    });
  }

  async getAllStudyrooms(query: StudyroomQuery): Promise<StudyroomListDto> {
    const studyrooms = await this.studyroomRepository.getAllStudyrooms(query);
    return StudyroomListDto.from(studyrooms);
  }

  async getStudyroomById(id: number): Promise<StudyroomDto> {
    const studyroom = await this.studyroomRepository.getStudyroomById(id);
    return StudyroomDto.from(studyroom);
  }

  async getStudyroomReservations(
    userId: string,
    payload: UserInfoPayload,
  ): Promise<StudyroomReservatoinListDto> {
    await this.reservationService.updateUserReservations(
      userId,
      payload.password,
    );
    const reservations = await this.studyroomRepository.getReservations(userId);
    return StudyroomReservatoinListDto.from(userId, reservations);
  }

  async checkUserAvailablity(
    userId: string,
    payload: StudyroomUserPayload,
  ): Promise<void> {
    await this.reservationService.checkUserAvailablity(userId, payload);
  }

  async reserveStudyroom(
    userId: string,
    payload: StudyroomReservePayload,
  ): Promise<void> {
    await this.reservationService.createReservation(userId, payload);
    await this.reservationService.updateUserReservations(
      userId,
      payload.password,
    );
  }

  async cancelStudyroomReservation(
    id: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<void> {
    await this.reservationService.cancelReservation(id, userId, payload);
    await this.studyroomRepository.deleteReservation(id, payload.cancelReason);
  }
}
