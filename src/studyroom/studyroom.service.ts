import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawStudyroom } from './types/rawStudyroom';

@Injectable()
export class StudyroomService {
  constructor(private readonly prismaService: PrismaService) {}

  private getSlotTime(time: string) {
    if (time.indexOf(':') === -1) {
      return -1;
    }
    return parseInt(time.split(':')[0]);
  }

  @Cron('*/10 * * * * *')
  async handleCron() {
    const res = await axios.get('http://34.22.85.208:8000/calendar');
    const studyRooms = res.data as RawStudyroom[];
    studyRooms.forEach(async (rawStudyRoom) => {
      await this.prismaService.$transaction([
        this.prismaService.studyroomSlot.deleteMany({
          where: {
            studyroomId: parseInt(rawStudyRoom.room_id),
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
}
