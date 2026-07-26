import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { DiscordService } from 'src/common/services/discord.service';
import { ExternalApiService } from 'src/common/services/external-api.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { StudyroomInfoListDto } from './dto/studyroom-infp.dto';
import { StudyroomReservationListDto } from './dto/studyroom-reservation.dto';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { UserPidDto } from './dto/userPid.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUpdatePayload } from './payload/studyroomUpdate.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDateQuery } from './query/studyroomDateQuery.query';
import { ReservationService } from './reservation.service';
import { StudyroomRepository } from './studyroom.repository';
import { RawStudyroom } from './types/rawStudyroom';

@Injectable()
export class StudyroomService {
  private readonly logger = new Logger(StudyroomService.name);
  private studyroomNames: string[] = [];
  private currentIndex = 0;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly studyroomRepository: StudyroomRepository,
    private readonly reservationService: ReservationService,
    private readonly externalApiService: ExternalApiService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private readonly discordService: DiscordService,
  ) {}

  private getSlotTime(time: string) {
    if (time.indexOf(':') === -1) {
      return -1;
    }
    return parseInt(time.split(':')[0]);
  }

  @Cron('*/2 * * * * *', {
    name: 'studyroomSlotCrawler',
  })
  async handleCron() {
    if (this.configService.get<string>('NODE_ENV') !== 'prod') {
      return;
    }

    const now = new Date();

    if (this.studyroomNames.length === 0 || now.getMinutes() === 0) {
      console.log('fetching studyroom ids');
      this.studyroomNames =
        await this.studyroomRepository.getAllStudyroomNames();
      this.currentIndex = 0;
    }

    const roomName = this.studyroomNames[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.studyroomNames.length;

    // console.log(roomName, this.currentIndex);

    // console.log('crawler start @', new Date());
    const res = await this.externalApiService.fetchStudyroom({ roomName });

    // console.log('crawler end @', new Date());
    const rawStudyroom = JSON.parse(res.data) as RawStudyroom;

    if (!rawStudyroom?.slots || !Array.isArray(rawStudyroom.slots)) {
      this.logger.warn(
        `Invalid crawler response for room ${roomName}: ${res.data}`,
      );
      return;
    }

    for (const slot of rawStudyroom.slots) {
      const room_id =
        await this.studyroomRepository.getStudyroomIdByName(roomName);
      const slotId = `${room_id}_${slot.date}_${slot.time}`;
      await this.prismaService.studyroomSlot.upsert({
        where: {
          id: slotId,
        },
        update: {
          isReserved: slot.is_reserved,
          isClosed: slot.is_closed,
        },
        create: {
          id: slotId,
          studyroomId: room_id,
          date: new Date(slot.date),
          startsAt: this.getSlotTime(slot.time),
          isReserved: slot.is_reserved,
          isClosed: slot.is_closed,
        },
      });
    }
  }

  @Cron('*/1 * * * *', {
    name: 'studyroomSlotCrawlerHealthCheck',
  })
  async healthCheck() {
    const recentStudyroomSlot =
      await this.prismaService.studyroomSlot.findFirst({
        where: {
          studyroom: {
            isActive: true,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

    // 활성화된 슬롯이 없다는 전제
    if (!recentStudyroomSlot) {
      return;
    }

    // 3분 이상 슬롯이 업데이트가 되지 않으면 에러 로그 발생
    if (recentStudyroomSlot.updatedAt.getTime() + 1000 * 60 * 3 < Date.now()) {
      await this.discordService.sendInternalErrorLog(
        new Error('Studyroom Slot Crawler is not working'),
      );
    }
  }

  async getAllStudyrooms(query: StudyroomQuery): Promise<StudyroomListDto> {
    const studyrooms = await this.studyroomRepository.getAllStudyrooms(query);
    return StudyroomListDto.from(studyrooms);
  }

  async getStudyroomById(
    id: number,
    query: StudyroomDateQuery,
  ): Promise<StudyroomDto> {
    const studyroom = await this.studyroomRepository.getStudyroomById(
      id,
      query,
    );
    if (!studyroom) {
      throw new NotFoundException('해당 id의 스터디룸을 찾을 수 없습니다.');
    }
    return StudyroomDto.from(studyroom);
  }

  async getStudyroomReservations(
    userId: string,
    payload: PasswordPayload,
  ): Promise<StudyroomReservationListDto> {
    await this.reservationService.updateUserReservations(
      userId,
      payload.password,
    );
    const reservations = await this.studyroomRepository.getReservations(userId);
    return StudyroomReservationListDto.from(reservations);
  }

  async checkUserAvailablity(
    userId: string,
    payload: StudyroomUserPayload,
  ): Promise<UserPidDto> {
    if (userId === payload.friendId) {
      throw new BadRequestException('자기 자신을 친구로 등록할 수 없습니다.');
    }

    const friendPid = await this.userService.getUserPid(
      {
        friendId: payload.friendId,
        friendName: payload.friendName,
        password: payload.password,
        date: payload.date,
      },
      userId,
    );

    const relation = await this.userRepository.getFriendRelation(
      payload.friendId,
      userId,
    );

    if (!relation || relation.deletedAt) {
      await this.userRepository.addUserAsFriend(
        relation,
        payload.friendId,
        userId,
      );
    }

    return friendPid;
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
    bookingId: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<void> {
    await this.reservationService.cancelReservation(bookingId, userId, payload);
    await this.studyroomRepository.deleteReservation(bookingId);
  }

  async updateStudyroom(
    id: number,
    payload: StudyroomUpdatePayload,
  ): Promise<void> {
    const studyroomInfo =
      await this.studyroomRepository.getStudyroomInfoById(id);

    await this.studyroomRepository.updateStudyroom(studyroomInfo.id, payload);
  }

  async getAllStudyroomInfo(): Promise<StudyroomInfoListDto> {
    const studyrooms = await this.studyroomRepository.getAllStudyroomInfo();
    return StudyroomInfoListDto.from(studyrooms);
  }
}
