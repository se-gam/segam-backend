import { BadRequestException, Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismService: PrismaService) {}

  async getUserByStudentId(studentId: string): Promise<UserInfo> {
    return this.prismService.user.findUnique({
      where: {
        studentId,
        deletedAt: null,
      },
      select: {
        studentId: true,
        sejongPid: true,
        name: true,
        department: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async addUserAsFriend(friendId: string, user: UserInfo): Promise<void> {
    await this.prismService.$transaction(async (tx) => {
      const isFriend = await tx.friend.findFirst({
        where: {
          OR: [
            {
              user1Id: user.studentId,
              user2Id: friendId,
            },
            {
              user1Id: friendId,
              user2Id: user.studentId,
            },
          ],
        },
      });

      if (isFriend) {
        throw new BadRequestException('이미 친구로 등록된 사용자입니다.');
      }

      await tx.friend.create({
        data: {
          user1Id: user.studentId,
          user2Id: friendId,
        },
      });
    });
  }
}
