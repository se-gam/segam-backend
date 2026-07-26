import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExternalApiService } from 'src/common/services/external-api.service';
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
    private readonly externalApiService: ExternalApiService,
  ) {}

  async updateUserReservations(userId: string, password: string) {
    const user = await this.userRepository.getUserByStudentId(userId);

    if (!user)
      throw new NotFoundException('해당 학번의 학생이 존재하지 않습니다');

    const res = await this.externalApiService.fetchStudyroomReservations({
      userId,
      password,
    });

    const response = JSON.parse(res.data);

    if (res.status === 404) {
      return await this.studyroomRepository.updateReservations(userId, []);
    } else if (res.status === 401) {
      throw new UnauthorizedException(response.result);
    } else if (res.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return await this.studyroomRepository.updateReservations(
      userId,
      response.result,
    );
  }

  async checkUserAvailablity(
    userId: string,
    payload: StudyroomUserPayload,
  ): Promise<UserPidDto> {
    const res = await this.externalApiService.fetchStudyroomAvailability({
      userId,
      password: payload.password,
      friendName: payload.friendName,
      friendId: payload.friendId,
      date: payload.date,
    });

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
    const res = await this.externalApiService.createStudyroomReservation({
      userId,
      password: payload.password,
      studyroomId: payload.studyroomId,
      users: payload.users,
      date: payload.date,
      startsAt: payload.startsAt,
      duration: payload.duration,
    });
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
    reservationId: number,
    userId: string,
    payload: StudyroomCancelPayload,
  ): Promise<ResultResponse> {
    const reservation =
      await this.studyroomRepository.getReservationById(reservationId);

    if (!reservation)
      throw new NotFoundException('해당 id의 예약이 존재하지 않습니다');

    if (reservation.visitorId !== userId)
      throw new BadRequestException('예약 취소는 예약자만 가능합니다');

    if (!reservation.bookingId)
      throw new BadRequestException(
        '취소할 수 없는 예약입니다 (bookingId 없음)',
      );

    const res = await this.externalApiService.cancelStudyroomReservation({
      userId,
      password: payload.password,
      bookingId: reservation.bookingId,
      cancelReason: payload.cancelReason,
    });

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
