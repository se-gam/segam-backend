import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExternalApiService } from 'src/common/services/external-api.service';
import { UserRepository } from 'src/user/user.repository';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
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

    const response = await this.externalApiService.fetchStudyroomReservations({
      userId,
      password,
    });

    if (response.status === 404) {
      return await this.studyroomRepository.updateReservations(userId, []);
    } else if (response.status === 401) {
      throw new UnauthorizedException(response.errorMessage);
    } else if (response.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return await this.studyroomRepository.updateReservations(
      userId,
      response.reservations.flatMap((reservation) => {
        if (reservation.duration === null || reservation.startsAt === null) {
          return [];
        }

        return [
          {
            booking_id: reservation.bookingId,
            ipid: reservation.ipid,
            room_name: reservation.roomName,
            duration: reservation.duration,
            date: reservation.date,
            starts_at: reservation.startsAt,
          },
        ];
      }),
    );
  }

  async createReservation(
    userId: string,
    payload: StudyroomReservePayload,
  ): Promise<ResultResponse> {
    const users = await this.userRepository.getUsersByStudentIds(
      payload.users,
    );
    const response = await this.externalApiService.createStudyroomReservation({
      userId,
      password: payload.password,
      studyroomId: payload.studyroomId,
      users: users.map((user) => ({
        student_id: user.studentId,
        name: user.name,
      })),
      date: payload.date,
      startsAt: payload.startsAt,
      duration: payload.duration,
    });
    if (response.status === 400 || response.status === 422) {
      throw new BadRequestException({
        message: response.error,
        content: response.content,
      });
    } else if (response.status === 401) {
      throw new UnauthorizedException(response.error);
    } else if (response.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    return { result: response.result };
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

    const response = await this.externalApiService.cancelStudyroomReservation({
      userId,
      password: payload.password,
      reserveNo: reservation.bookingId,
      cancelReason: payload.cancelReason,
    });

    if (response.status === 401) {
      throw new UnauthorizedException(response.errorMessage);
    } else if (response.status >= 400) {
      throw new InternalServerErrorException('Internal Server Error');
    }

    if (!response.result) {
      throw new InternalServerErrorException(
        '예약 취소 응답이 올바르지 않습니다.',
      );
    }

    if (!response.result.ok) {
      throw new NotFoundException(response.result.resultMessage);
    }

    return { result: response.result.resultMessage };
  }
}
