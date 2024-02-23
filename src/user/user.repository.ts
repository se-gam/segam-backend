import { User } from '@prisma/client';
import { RawUser } from 'src/studyroom/types/reservationResponse.type';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByStudentId2(id: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        studentId: id,
      },
    });
  }

  async getUserByStudentId(studentId: string): Promise<UserInfo> {
    return this.prismaService.user.findUnique({
      where: {
        studentId,
        deletedAt: null,
      },
      select: {
        studentId: true,
        sejongPid: true,
        name: true,
        departmentName: true,
      },
    });
  }

  async getUsersByStudentIds(ids: string[]): Promise<User[]> {
    return await this.prismaService.user.findMany({
      where: {
        studentId: {
          in: ids,
        },
      },
    });
  }

  async updateUserPid(studentId: string, pid: string) {
    await this.prismaService.user.update({
      where: {
        studentId: studentId,
      },
      data: {
        sejongPid: pid,
      },
    });
  }

  async createNewUsers(rawUsers: RawUser[]) {
    await this.prismaService.user.createMany({
      data: rawUsers.map((user) => {
        return {
          studentId: user.student_id,
          sejongPid: user.student_id,
          name: user.name,
        };
      }),
      skipDuplicates: true,
    });
  }

  async addUserAsFriend(friendId: string, user: UserInfo): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
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

      if (isFriend && !isFriend.deletedAt) {
        throw new BadRequestException('이미 친구로 등록된 사용자입니다.');
      } else if (isFriend && isFriend.deletedAt) {
        await tx.friend.update({
          where: {
            id: isFriend.id,
          },
          data: {
            deletedAt: null,
          },
        });
      } else {
        await tx.friend.create({
          data: {
            user1Id: user.studentId,
            user2Id: friendId,
          },
        });
      }
    });
  }

  async deleteFriend(friendId: string, user: UserInfo): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
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

      if (!isFriend || (isFriend && isFriend.deletedAt)) {
        throw new BadRequestException('친구로 등록되지 않은 사용자입니다.');
      }

      await tx.friend.updateMany({
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
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }
}