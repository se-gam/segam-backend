import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Validate } from 'class-validator';
import { PasswordValidator } from '../validator/password.validator';

export class PasswordPayload {
  @IsOptional()
  @IsString()
  @Validate(PasswordValidator)
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password?: string;
}
