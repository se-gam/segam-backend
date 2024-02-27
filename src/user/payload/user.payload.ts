import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PasswordPayload } from 'src/auth/payload/password.payload';

export class UserPayload extends PasswordPayload {
  @IsString()
  @ApiProperty({
    description: '추가할 친구의 학번입니다',
    example: '17011584',
    type: String,
  })
  studentId!: string;

  @IsString()
  @ApiProperty({
    description: '추가할 친구의 이름입니다',
    example: '정재경',
    type: String,
  })
  name!: string;
}
