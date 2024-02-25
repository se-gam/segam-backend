import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PasswordPayload {
  @IsString()
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;
}
