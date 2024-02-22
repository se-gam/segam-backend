import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserInfoPayload {
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  @IsString()
  password!: string;
}
