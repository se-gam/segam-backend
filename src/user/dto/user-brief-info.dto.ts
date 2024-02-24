import { ApiProperty } from '@nestjs/swagger';
import { UserBriefInfo } from '../type/user-brief-info.type';

export class UserBriefInfoDto {
  @ApiProperty({
    description: '학번',
    type: String,
  })
  studentId!: string;

  @ApiProperty({
    description: '이름',
    type: String,
  })
  name!: string;

  static from(user: UserBriefInfo): UserBriefInfoDto {
    return {
      studentId: user.studentId,
      name: user.name,
    };
  }
}
