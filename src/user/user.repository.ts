import { BadRequestException, Injectable } from '@nestjs/common';
import { Friend, User } from '@prisma/client';
import * as _ from 'lodash';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawUser } from 'src/studyroom/types/reservationResponse.type';
import { PushTokenPayload } from './payload/pushToken.payload';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updatePushToken(
    payload: PushTokenPayload,
    user: UserInfo,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: {
        studentId: user.studentId,
      },
      data: {
        pushToken: payload.pushToken,
        os: payload.os,
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

  async getFriendRelation(friendId: string, userId: string): Promise<Friend> {
    const friend = await this.prismaService.friend.findUnique({
      where: {
        requestUserId_receiveUserId: {
          receiveUserId: friendId,
          requestUserId: userId,
        },
      },
    });

    return friend;
  }

  async addUserAsFriend(
    relation: Friend | null,
    friendId: string,
    userId: string,
  ): Promise<void> {
    if (!relation) {
      await this.prismaService.friend.create({
        data: {
          requestUserId: userId,
          receiveUserId: friendId,
        },
      });
    } else if (relation.deletedAt) {
      await this.prismaService.friend.update({
        where: {
          id: relation.id,
        },
        data: {
          deletedAt: null,
        },
      });
    }
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

  async deleteUser(user: UserInfo): Promise<void> {
    await this.prismaService.user.update({
      where: {
        studentId: user.studentId,
      },
      data: {
        deletedAt: new Date(),
        pushToken: null,
      },
    });
  }
}
