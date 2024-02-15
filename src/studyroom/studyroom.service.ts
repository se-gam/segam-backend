import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawStudyroom } from './types/rawStudyroom';

@Injectable()
export class StudyroomService {
  constructor(
    private readonly prismaService: PrismaService,
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

    studyRooms.forEach(async (rawStudyRoom: RawStudyroom) => {
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
}
