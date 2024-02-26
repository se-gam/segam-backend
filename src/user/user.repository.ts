import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawUser } from 'src/studyroom/types/reservationResponse.type';
import * as _ from 'lodash';
import { UserPayload } from './payload/user.payload';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updatePushToken(pushToken: string, user: UserInfo): Promise<void> {
    await this.prismaService.user.update({
      where: {
        studentId: user.studentId,
      },
      data: {
        pushToken,
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

  async createUser(payload: UserPayload, sejongPid: string) {
    await this.prismaService.user.create({
      data: {
        studentId: payload.studentId,
        name: payload.name,
        sejongPid: sejongPid,
      },
    });
  }

  async updateOrCreateUser(
    studentId: string,
    name: string,
    sejongPid: string,
  ): Promise<void> {
    await this.prismaService.user.upsert({
      where: {
        studentId: studentId,
      },
      update: {
        sejongPid: sejongPid,
        deletedAt: null,
      },
      create: {
        studentId: studentId,
        sejongPid: sejongPid,
        name: name,
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

  async addUserAsFriend(friendId: string, userId: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const isFriend = await tx.friend.findFirst({
        where: {
          requestUserId: userId,
          receiveUserId: friendId,
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
            requestUserId: userId,
            receiveUserId: friendId,
          },
        });
      }
    });
  }

  async deleteFriend(friendId: string, user: UserInfo): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const isFriend = await tx.friend.findUnique({
        where: {
          requestUserId_receiveUserId: {
            requestUserId: user.studentId,
            receiveUserId: friendId,
          },
        },
      });

      if (!isFriend || (isFriend && isFriend.deletedAt)) {
        throw new BadRequestException('친구로 등록되지 않은 사용자입니다.');
      }

      await tx.friend.updateMany({
        where: {
          id: isFriend.id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });
  }

  async getFriendsByStudentId(studentId: string): Promise<UserInfo[]> {
    return await this.prismaService.$transaction(async (tx) => {
      const friends = await tx.friend.findMany({
        where: {
          requestUserId: studentId,
          deletedAt: null,
        },
        select: {
          receiveUserId: true,
        },
      });

      const friendIds = _.flatMap(friends, 'receiveUserId');

      return tx.user.findMany({
        where: {
          studentId: {
            in: friendIds,
          },
          deletedAt: null,
        },
        select: {
          studentId: true,
          sejongPid: true,
          name: true,
          departmentName: true,
        },
      });
    });
  }
}
