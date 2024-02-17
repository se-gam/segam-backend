import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawStudyroom } from './types/rawStudyroom';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomRepository } from './studyroom.repository';
import {
  StudyroomReservationDto,
  StudyroomReservatoinListDto,
} from './dto/studyroomReservation.dto';
import { UserInfoPayload } from 'src/user/payload/UserInfoPayload.payload';
import { ReservationService } from './reservation.service';

@Injectable()
export class StudyroomService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly studyroomRepository: StudyroomRepository,
    private readonly reservationService: ReservationService,
    private readonly axiosService: AxiosService,
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
      process.env.CRAWLER_API_ROOT + '/calendar',
    );
    const studyRooms = JSON.parse(res.data);

    const upsertSlots = studyRooms.flatMap((rawStudyroom) => {
      return rawStudyroom.slots.map((slot) => {
        const slotId = `${rawStudyroom.room_id}_${slot.date}_${slot.time}`;
        return this.prismaService.studyroomSlot.upsert({
          create: {
            id: slotId,
            studyroomId: parseInt(rawStudyroom.room_id),
            date: new Date(slot.date),
            startsAt: this.getSlotTime(slot.time),
            isReserved: slot.is_reserved,
            isClosed: slot.is_closed,
          },
          update: {
            isReserved: slot.is_reserved,
          },
          where: {
            id: slotId,
          },
        });
      });
    });

    await this.prismaService.$transaction(upsertSlots);
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
    payload: UserInfoPayload,
  ): Promise<StudyroomReservatoinListDto> {
    await this.reservationService.updateUserReservations(payload);
    const reservations = await this.studyroomRepository.getReservations(
      payload.student_id,
    );
    return StudyroomReservatoinListDto.from(reservations);
  }
}
