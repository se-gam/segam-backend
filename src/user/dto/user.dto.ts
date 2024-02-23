import { ApiProperty } from '@nestjs/swagger';
import { User } from '../type/user.type';

export class UserInfoDto {
  studentId!: string;
  name!: string;

  static from(user: User): UserInfoDto {
    return {
      studentId: user.studentId,
      name: user.name,
    };
  }
}

export class UserDto {
  @ApiProperty({
    description: '학번',
    type: String,
  })
  studentId!: string;

  @ApiProperty({
    description: '세종대학교 학술정보원 PID',
    type: String,
  })
  sejongPid!: string;

  @ApiProperty({
    description: '이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '학과 정보',
    type: String,
  })
  department?: string;
}
