import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
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
  ) {}

  private getSlotTime(time: string) {
    if (time.indexOf(':') === -1) {
      return -1;
    }
    return parseInt(time.split(':')[0]);
  }

  @Cron('*/10 * * * * *')
  async handleCron() {
    const res = await axios.get(process.env.CRAWLER_API_ROOT + '/calendar');
    const studyRooms = res.data as RawStudyroom[];
    studyRooms.forEach(async (rawStudyRoom) => {
      await this.prismaService.$transaction([
        this.prismaService.studyroomSlot.deleteMany({
          where: {
            id: {
              in: rawStudyRoom.slots.map(
                (slot) => `${rawStudyRoom.room_id}_${slot.date}_${slot.time}`,
              ),
            },
          },
        }),
        this.prismaService.studyroomSlot.createMany({
          data: rawStudyRoom.slots.map((slot) => {
            return {
              id: `${rawStudyRoom.room_id}_${slot.date}_${slot.time}`,
              studyroomId: parseInt(rawStudyRoom.room_id),
              date: new Date(slot.date),
              startsAt: this.getSlotTime(slot.time),
              isReserved: slot.is_reserved,
              isClosed: slot.is_closed,
            };
          }),
          skipDuplicates: true,
        }),
      ]);
    });

    // const studyRoomSlots = await this.prismaService.studyroomSlot.findMany({});
    // console.log(studyRoomSlots);

    // console.log('------------------------');
    // const studyRooms = await this.prismaService.studyroom.findMany({});
    // console.log(studyRooms);
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
      payload.studentId,
    );
    return StudyroomReservatoinListDto.from(reservations);
  }
}
