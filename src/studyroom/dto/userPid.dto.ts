import { ApiProperty } from '@nestjs/swagger';

export class UserPidDto {
  @ApiProperty({
    description: 'User Pid',
  })
  sejongPid!: string;

  static from(sejongPid: string): UserPidDto {
    return { sejongPid };
  }
}
