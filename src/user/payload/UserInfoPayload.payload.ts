import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { StudyroomReservePayload } from 'src/studyroom/payload/studyroomReserve.payload';

export class UserInfoPayload {
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  @IsString()
  password!: string;

  static from(password: string) {
    return {
      password: password,
    };
  }
}
