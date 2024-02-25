import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from 'src/auth/types/user-info.type';

export class FriendDto {
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

  static from(user: UserInfo): FriendDto {
    return {
      studentId: user.studentId,
      sejongPid: user.sejongPid,
      name: user.name,
      department: user.departmentName,
    };
  }
}

export class FriendListDto {
  @ApiProperty({
    description: '친구 목록',
    type: [FriendDto],
  })
  friends!: FriendDto[];

  static from(users: UserInfo[]): FriendListDto {
    return {
      friends: users.map((user) => FriendDto.from(user)),
    };
  }
}
