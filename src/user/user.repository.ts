import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/common/services/prisma.service';
import { RawUser } from 'src/studyroom/types/reservationResponse.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByStudentId(id: string): Promise<User> {
    return await this.prismaService.user.findUnique({
      where: {
        studentId: id,
      },
    });
  }

  async createNewUsers(rawUsers: RawUser[]) {
    await this.prismaService.user.createMany({
      data: rawUsers.map((user) => {
        return {
          studentId: user.student_id,
          name: user.name,
        };
      }),
      skipDuplicates: true,
    });
  }
}
