import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInfoPayload } from 'src/user/payload/UserInfoPayload.payload';
import { StudyroomRepository } from './studyroom.repository';
import axios from 'axios';
import { ReservationResponse } from './types/reservationResponse.type';
import { UserRepository } from 'src/user/user.repository';
import * as _ from 'lodash';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { ResultResponse } from './types/resultResponse.type';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { AxiosService } from 'src/common/services/axios.service';

@Injectable()
export class ReservationService {
  constructor(
    private readonly studyroomRepository: StudyroomRepository,
    private readonly userRepository: UserRepository,
    private readonly axiosService: AxiosService,
  ) {}

  async updateUserReservations(userId: string, payload: UserInfoPayload) {
    const user = await this.userRepository.getUserByStudentId(userId);

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    try {
      const response = await axios.post<ReservationResponse>(
        process.env.GET_USER_RESEVATIONS_URL,
        {
          student_id: userId,
          password: payload.password,
        },
      );

      await this.userRepository.createNewUsers(
        _.flatMap(response.data.result, 'users'),
      );

      await this.studyroomRepository.updateReservations(userId, response.data);
    } catch (error) {
      console.log(error.response.data.result);

      if (error.response.status == 401) {
        throw new UnauthorizedException(error.response.data.result);
      } else if (error.response.status != 404) {
        throw new InternalServerErrorException('서버에서 오류가 발생했습니다.');
      }
    }
  }

  async createReservation(
    userId: string,
    payload: StudyroomReservePayload,
  ): Promise<ResultResponse> {
    const rawUsers = await this.userRepository.getUsersByStudentIds([
      ...payload.users,
      userId,
    ]);
    if (rawUsers.length != payload.users.length + 1)
      throw new InternalServerErrorException('모든 유저를 찾지 못했습니다.');
    const users = rawUsers.map((user) => {
      return {
        name: user.name,
        student_id: user.studentId,
        ipid: user.sejongPid,
      };
    });

    try {
      const response = await this.axiosService.post<ResultResponse>(
        process.env.CREATE_RESERVATION_URL,
        {
          id: userId,
          password: payload.password,
          room_id: payload.studyroomId,
          users: users,
          year: payload.date.getFullYear().toString(),
          month: (payload.date.getMonth() + 1).toString(),
          day: payload.date.getDate().toString(),
          start_time: payload.startsAt.toString(),
          hours: payload.duration.toString(),
          purpose: payload.reason,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.status);
      console.log(error.response.data.result);
      throw error;
    }
  }

  async cancelReservation(
    id: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<ResultResponse> {
    const reservation = await this.studyroomRepository.getReservationById(id);

    if (!reservation)
      throw new NotFoundException('해당 id의 예약이 존재하지 않습니다');

    try {
      const response = await this.axiosService.post<ResultResponse>(
        process.env.CANCEL_RESERVATION_URL,
        {
          id: userId,
          password: payload.password,
          booking_id: id.toString(),
          room_id: reservation.studyroomId,
          cancel_msg: payload.cancelReason,
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response.status);
      console.log(error.response.data.result);
      if (error.response.status == 400) {
        throw new BadRequestException('예약을 찾을 수 없습니다.');
      } else {
        throw error;
      }
    }
  }
}
