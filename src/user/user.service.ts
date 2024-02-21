import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { UserPayload } from './payload/user.payload';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async addUserAsFriend(payload: UserPayload, user: UserInfo): Promise<void> {
    const friend = await this.userRepository.getUserByStudentId(
      payload.studentId,
    );
    if (!friend) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }
    if (user.studentId === friend.studentId) {
      throw new BadRequestException('자기 자신을 친구로 등록할 수 없습니다.');
    }

    await this.userRepository.addUserAsFriend(friend.studentId, user);
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
}
