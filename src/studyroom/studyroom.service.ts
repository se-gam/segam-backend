import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { AxiosService } from 'src/common/services/axios.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomReservationListDto } from './dto/studyroomReservation.dto';
import { UserPidDto } from './dto/userPid.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDateQuery } from './query/studyroomDateQuery.query';
import { ReservationService } from './reservation.service';
import { StudyroomRepository } from './studyroom.repository';
import { RawStudyroom } from './types/rawStudyroom';

@Injectable()
export class StudyroomService {
  private studyroomIds: number[] = [];
  private currentIndex = 0;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly studyroomRepository: StudyroomRepository,
    private readonly reservationService: ReservationService,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
  ) {}

  private getSlotTime(time: string) {
    if (time.indexOf(':') === -1) {
      return -1;
    }
    return parseInt(time.split(':')[0]);
  }

  @Cron('*/3 * * * * *')
  async handleCron() {
    if (this.configService.get<string>('NODE_ENV') !== 'prod') {
      return;
    }

    if (!this.studyroomIds.length) {
      console.log('fetching studyroom ids');
      this.studyroomIds = await this.studyroomRepository.getAllStudyroomIds();
    }

    const roomId = this.studyroomIds[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.studyroomIds.length;

    console.log(roomId, this.currentIndex);

    console.log('crawler start @', new Date());
    const res = await this.axiosService.get(
      this.configService.get<string>('CRAWLER_API_ROOT') +
        `/calendar/${roomId}`,
    );

    console.log('crawler end @', new Date());
    const rawStudyroom = JSON.parse(res.data) as RawStudyroom;

    for (const slot of rawStudyroom.slots) {
      const slotId = `${rawStudyroom.room_id}_${slot.date}_${slot.time}`;
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
          studyroomId: parseInt(rawStudyroom.room_id),
          date: new Date(slot.date),
          startsAt: this.getSlotTime(slot.time),
          isReserved: slot.is_reserved,
          isClosed: slot.is_closed,
        },
      });
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
    return StudyroomReservationListDto.from(userId, reservations);
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
    await this.studyroomRepository.deleteReservation(
      bookingId,
      payload.cancelReason,
    );
  }
}
