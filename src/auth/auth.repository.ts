import { Injectable } from '@nestjs/common';
import { DiscordService } from 'src/common/services/discord.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { number2emoji } from 'src/common/utils/number2emoji';
import { SignUpPayload } from './payload/signup.payload';
import { PortalUserInfo } from './types/portal-user.type';
import { UserInfo } from './types/user-info.type';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly discordService: DiscordService,
  ) {}

  private async sendNewUserLog(studentId: string, name: string) {
    const userCount = await this.prismaService.user.count({
      where: {
        deletedAt: null,
        department: {
          isNot: null,
        },
      },
    });
    this.discordService.sendNewUserLog(
      `🎉*회원가입 알림*🎉\n${studentId} ${name}님이 가입하셨습니다!!\n\n🔥전체 유저 수: ${number2emoji(userCount)}명 돌파!!🔥`,
    );
  }

  async getOrCreateUser(
    portalUserInfo: PortalUserInfo,
    payload: SignUpPayload,
  ): Promise<UserInfo> {
    return await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          studentId: portalUserInfo.studentId,
        },
        select: {
          studentId: true,
          sejongPid: true,
          name: true,
          departmentName: true,
        },
      });

      if (!user.departmentName) {
        await tx.user.update({
          where: {
            studentId: portalUserInfo.studentId,
          },
          data: {
            department: {
              connectOrCreate: {
                where: {
                  name: portalUserInfo.department,
                },
                create: {
                  name: portalUserInfo.department,
                },
              },
            },
          },
        });

        this.sendNewUserLog(user.studentId, user.name);
        return user;
      }

      if (!user) {
        const newUser = await tx.user.create({
          data: {
            studentId: portalUserInfo.studentId,
            sejongPid: portalUserInfo.studentId,
            name: portalUserInfo.name,
            os: payload.os,
            pushToken: payload.pushToken,
            department: {
              connectOrCreate: {
                where: {
                  name: portalUserInfo.department,
                },
                create: {
                  name: portalUserInfo.department,
                },
              },
            },
          },
          select: {
            studentId: true,
            sejongPid: true,
            name: true,
            departmentName: true,
          },
        });

        this.sendNewUserLog(newUser.studentId, newUser.name);

        return newUser;
      } else {
        const rejoinedUser = await tx.user.update({
          where: {
            studentId: portalUserInfo.studentId,
          },
          data: {
            os: payload.os,
            pushToken: payload.pushToken,
            deletedAt: null,
          },
          select: {
            studentId: true,
            name: true,
          },
        });

        this.sendNewUserLog(rejoinedUser.studentId, rejoinedUser.name);
      }

      return user;
    });
  }
}
