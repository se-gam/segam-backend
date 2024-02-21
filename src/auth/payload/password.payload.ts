import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PasswordPayload {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password?: string;
}
