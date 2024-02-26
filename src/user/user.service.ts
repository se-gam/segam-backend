import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { FriendListDto } from './dto/friend.dto';
import { PushTokenPayload } from './payload/pushToken.payload';
import { UserPayload } from './payload/user.payload';
import { UserRepository } from './user.repository';
import { ReservationService } from 'src/studyroom/reservation.service';
import { StudyroomUserPayload } from 'src/studyroom/payload/studyroomUserPayload.payload';
import { UserPidDto } from 'src/studyroom/dto/userPid.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly reservationService: ReservationService,
  ) {}

  private static verificationDate = new Date('2023-02-30');

  async updatePushToken(
    payload: PushTokenPayload,
    user: UserInfo,
  ): Promise<void> {
    await this.userRepository.updatePushToken(payload.pushToken, user);
  }

  async getUserPid(
    payload: StudyroomUserPayload,
    userId: string,
  ): Promise<UserPidDto> {
    const friendPid = await this.reservationService.checkUserAvailablity(
      userId,
      payload,
    );

    return UserPidDto.from(friendPid.sejongPid);
  }

  async addUserAsFriend(payload: UserPayload, user: UserInfo): Promise<void> {
    const friend = await this.userRepository.getUserByStudentId(
      payload.studentId,
    );

    if (!friend) {
      try {
        await this.getUserPid(
          {
            friendId: payload.studentId,
            friendName: payload.name,
            password: payload.password,
            date: UserService.verificationDate,
          },
          user.studentId,
        );
      } catch (error) {
        if (error.status === 400) {
          throw new BadRequestException('해당 id의 학생을 찾을 수 없습니다.');
        } else if (error.status === 401) {
          throw new UnauthorizedException('포털 로그인에 실패했습니다.');
        } else if (error.status >= 400) {
          throw new InternalServerErrorException('Internal Server Error');
        }
      }
    } else if (user.studentId === friend.studentId) {
      throw new BadRequestException('자기 자신을 친구로 등록할 수 없습니다.');
    }

    await this.userRepository.addUserAsFriend(
      payload.studentId,
      user.studentId,
    );
  }

  async deleteFriend(friendId: string, user: UserInfo): Promise<void> {
    const friend = await this.userRepository.getUserByStudentId(friendId);
    if (!friend) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    if (user.studentId === friend.studentId) {
      throw new BadRequestException('자기 자신을 친구에서 삭제할 수 없습니다.');
    }

    await this.userRepository.deleteFriend(friend.studentId, user);
  }

  async getFriends(user: UserInfo): Promise<FriendListDto> {
    return FriendListDto.from(
      await this.userRepository.getFriendsByStudentId(user.studentId),
    );
  }
}
