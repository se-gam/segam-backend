import { ApiProperty } from '@nestjs/swagger';
import { IsString, Validate } from 'class-validator';
import { PasswordValidator } from '../validator/password.validator';

export class SignUpPayload {
  @IsString()
  @ApiProperty({
    description: '학번',
    type: String,
    example: '17011584',
  })
  studentId!: string;

  @IsString()
  @Validate(PasswordValidator)
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;
}
