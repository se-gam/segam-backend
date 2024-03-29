import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { AxiosService } from 'src/common/services/axios.service';
import { UserRepository } from 'src/user/user.repository';
import { UserPidDto } from './dto/userPid.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomRepository } from './studyroom.repository';
import { ResultResponse } from './types/resultResponse.type';

@Injectable()
export class ReservationService {
  constructor(
    private readonly studyroomRepository: StudyroomRepository,
    private readonly userRepository: UserRepository,
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
  ) {}

  async updateUserReservations(userId: string, password: string) {
    const user = await this.userRepository.getUserByStudentId(userId);

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    const res = await this.axiosService.post(
      this.configService.get<string>('GET_USER_RESERVATIONS_URL'),
      JSON.stringify({ student_id: userId, password: password }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    const response = JSON.parse(res.data);

    if (res.status === 404) {
      return await this.studyroomRepository.updateReservations(userId, []);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.result);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    await this.userRepository.createNewUsers(
      _.flatMap(response.result, 'users'),
    );

    return await this.studyroomRepository.updateReservations(
      userId,
      response.result,
    );
  }

  async checkUserAvailablity(
    userId: string,
    payload: StudyroomUserPayload,
  ): Promise<UserPidDto> {
    const res = await this.axiosService.post(
      this.configService.get<string>('GET_USER_AVAILABILITY_URL'),
      JSON.stringify({
        id: userId,
        password: payload.password,
        user_name: payload.friendName,
        student_id: payload.friendId,
        year: payload.date.getFullYear(),
        month: String(payload.date.getMonth() + 1).padStart(2, '0'),
        day: String(payload.date.getDate()).padStart(2, '0'),
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
    const friendPid: string = response.ipid.toString();
    if (!friendPid)
      throw new InternalServerErrorException('추가할 수 없는 사용자입니다.');

    await this.userRepository.updateOrCreateUser(
      payload.friendId,
      payload.friendName,
      friendPid,
    );

    return UserPidDto.from(friendPid);
  }

  async createReservation(
    userId: string,
    payload: StudyroomReservePayload,
  ): Promise<ResultResponse> {
    const rawUsers = await this.userRepository.getUsersByStudentIds(
      payload.users,
    );
    if (rawUsers.length !== payload.users.length)
      throw new InternalServerErrorException('모든 유저를 찾지 못했습니다.');
    const users = rawUsers.map((user) => {
      return {
        name: user.name,
        student_id: user.studentId,
        ipid: user.sejongPid,
      };
    });

    const res = await this.axiosService.post(
      this.configService.get<string>('CREATE_RESERVATION_URL'),
      JSON.stringify({
        id: userId,
        password: payload.password,
        room_id: payload.studyroomId,
        users: users,
        year: payload.date.getFullYear(),
        month: String(payload.date.getMonth() + 1).padStart(2, '0'),
        day: String(payload.date.getDate()).padStart(2, '0'),
        start_time: payload.startsAt,
        hours: payload.duration,
        purpose: payload.reason,
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
      throw new UnauthorizedException(response);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return response;
  }

  async cancelReservation(
    bookingId: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<ResultResponse> {
    const reservation =
      await this.studyroomRepository.getReservationById(bookingId);

    if (!reservation)
      throw new NotFoundException('해당 id의 예약이 존재하지 않습니다');

    const isLeader = await this.studyroomRepository.isReservationLeader(
      reservation.id,
      userId,
    );

    if (!isLeader)
      throw new BadRequestException('예약 취소는 예약자만 가능합니다');

    const res = await this.axiosService.post(
      this.configService.get<string>('CANCEL_RESERVATION_URL'),
      JSON.stringify({
        id: userId,
        password: payload.password,
        booking_id: reservation.id.toString(),
        room_id: reservation.studyroomId.toString(),
        cancel_msg: payload.cancelReason,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const response = JSON.parse(res.data);
    if (res.status === 400) {
      throw new BadRequestException(response.result);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.result);
    } else if (res.status === 404) {
      throw new NotFoundException(response.result);
    } else if (res.status >= 400) {
      console.error(response);
      throw new InternalServerErrorException('Internal Server Error');
    }

    return response;
  }
}
