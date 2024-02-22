import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { StudyroomRepository } from './studyroom.repository';
import axios from 'axios';
import { ReservationResponse } from './types/reservationResponse.type';
import { UserRepository } from 'src/user/user.repository';
import * as _ from 'lodash';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { ResultResponse } from './types/resultResponse.type';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { AxiosService } from 'src/common/services/axios.service';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { UserPidResponse } from './types/userPidResponse.type';
import { ConfigService } from '@nestjs/config';

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

    try {
      const response = await axios.post<ReservationResponse>(
        this.configService.get<string>('GET_USER_RESEVATIONS_URL'),
        {
          student_id: userId,
          password: password,
        },
      );

      await this.userRepository.createNewUsers(
        _.flatMap(response.data.result, 'users'),
      );

      await this.studyroomRepository.updateReservations(userId, response.data);
    } catch (error) {
      console.log(error.response);
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async checkUserAvailablity(
    userId: string,
    payload: StudyroomUserPayload,
  ): Promise<UserPidResponse> {
    const friend = await this.userRepository.getUserByStudentId(
      payload.friendId,
    );
    if (!friend)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    const response = await this.axiosService.post(
      this.configService.get<string>('GET_USER_AVAILABILITY_URL'),
      JSON.stringify({
        id: userId,
        password: payload.password,
        user_name: friend.name,
        student_id: friend.studentId,
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

    if (response.status >= 400) {
      console.log(response);
      throw new HttpException(response.data.error, response.status);
    }

    const friendPid = JSON.parse(response.data).ipid.toString();

    if (!friendPid)
      throw new InternalServerErrorException('추가할 수 없는 사용자입니다.');

    if (friend.sejongPid !== friendPid) {
      await this.userRepository.updateUserPid(friend.studentId, friendPid);
    }

    return response.data;
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
    if (res.status >= 400) {
      throw new HttpException(response.error, res.status);
    }
    return res.data;
  }

  async cancelReservation(
    id: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<ResultResponse> {
    const reservation = await this.studyroomRepository.getReservationById(id);

    if (!reservation)
      throw new NotFoundException('해당 id의 예약이 존재하지 않습니다');

    const response = await this.axiosService.post(
      this.configService.get<string>('CANCEL_RESERVATION_URL'),
      JSON.stringify({
        id: userId,
        password: payload.password,
        booking_id: `${reservation.id}`,
        room_id: `${reservation.studyroomId}`,
        cancel_msg: payload.cancelReason,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status >= 400) {
      console.log(response.status, JSON.parse(response.data).result);
      throw new HttpException(
        JSON.parse(response.data).result,
        response.status,
      );
    }
    return response.data;
  }
}
