import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { DiscordService } from 'src/common/services/discord.service';
import { FriendListDto } from './dto/friend.dto';
import { PushTokenPayload } from './payload/pushToken.payload';
import { UserPayload } from './payload/user.payload';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly discordService: DiscordService,
  ) {}

  async updatePushToken(
    payload: PushTokenPayload,
    user: UserInfo,
  ): Promise<void> {
    await this.userRepository.updatePushToken(payload, user);
  }

  async addUserAsFriend(
    payload: Pick<UserPayload, 'studentId' | 'name'>,
    user: UserInfo,
  ): Promise<void> {
    const friend = await this.userRepository.getUserByStudentId(
      payload.studentId,
    );

    if (!friend) {
      await this.userRepository.updateOrCreateUser(
        payload.studentId,
        payload.name,
        payload.studentId,
      );
    } else if (user.studentId === friend.studentId) {
      throw new BadRequestException('자기 자신을 친구로 등록할 수 없습니다.');
    }

    const relation = await this.userRepository.getFriendRelation(
      payload.studentId,
      user.studentId,
    );

    if (relation && !relation.deletedAt) {
      throw new BadRequestException('이미 친구로 등록된 사용자입니다.');
    }

    await this.userRepository.addUserAsFriend(
      relation,
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

  async deleteUser(user: UserInfo): Promise<void> {
    await this.userRepository.deleteUser(user);
    await this.discordService.sendQuitLog(user.studentId, user.name);
  }
}
