import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate } from 'class-validator';
import { PasswordValidator } from '../validator/password.validator';

export class PasswordPayload {
  @IsString()
  @Validate(PasswordValidator)
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;
}
