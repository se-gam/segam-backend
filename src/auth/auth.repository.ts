import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { PortalUserInfo } from './types/portal-user.type';
import { UserInfo } from './types/user-info.type';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getOrCreateUser(portalUserInfo: PortalUserInfo): Promise<UserInfo> {
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

      if (!user) {
        return await tx.user.create({
          data: {
            studentId: portalUserInfo.studentId,
            sejongPid: portalUserInfo.studentId,
            name: portalUserInfo.name,
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
      }

      return user;
    });
  }
}
