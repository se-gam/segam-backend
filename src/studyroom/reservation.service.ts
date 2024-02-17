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

@Injectable()
export class ReservationService {
  constructor(
    private readonly studyroomRepository: StudyroomRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async updateUserReservations(payload: UserInfoPayload) {
    const user = await this.userRepository.getUserByStudentId(
      payload.studentId,
    );

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    try {
      const response = await axios.post<ReservationResponse>(
        process.env.GET_USER_RESEVATIONS_URL,
        {
          student_id: payload.studentId,
          password: payload.password,
        },
      );

      await this.userRepository.createNewUsers(
        _.flatMap(response.data.result, 'users'),
      );

      await this.studyroomRepository.updateReservations(
        payload.studentId,
        response.data,
      );
    } catch (error) {
      console.log(error.response.data.result);

      if (error.response.status == 401) {
        throw new UnauthorizedException(error.response.data.result);
      } else if (error.response.status != 404) {
        throw new InternalServerErrorException('서버에서 오류가 발생했습니다.');
      }
    }
  }

  async cancelReservation(
    id: number,
    payload: StudyroomCancelPayload,
  ): Promise<ResultResponse> {
    const reservation = await this.studyroomRepository.getReservationById(id);

    if (!reservation)
      throw new NotFoundException('해당 id의 예약이 존재하지 않습니다');

    try {
      const response = await axios.post<ResultResponse>(
        process.env.CANCEL_RESERVATION_URL,
        {
          id: payload.studentId,
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
