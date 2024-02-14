import {
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

@Injectable()
export class ReservationService {
  constructor(
    private readonly studyroomRepository: StudyroomRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async updateUserReservations(payload: UserInfoPayload) {
    const user = await this.userRepository.getUserByStudentId(
      payload.student_id,
    );

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    try {
      const response = await axios.post<ReservationResponse>(
        process.env.RESERVATION_URL,
        payload,
      );

      await this.userRepository.createNewUsers(
        _.flatMap(response.data.result, 'users'),
      );

      await this.studyroomRepository.updateReservations(
        payload.student_id,
        response.data,
      );
    } catch (error) {
      console.error(error);

      if (error.response.status == 401) {
        throw new UnauthorizedException(error.response.data.result);
      } else if (error.response.status != 404) {
        throw new InternalServerErrorException('서버에서 오류가 발생했습니다.');
      }
    }
  }
}
