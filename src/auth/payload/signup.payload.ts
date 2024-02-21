import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignUpPayload {
  @IsString()
  @ApiProperty({
    description: '학번',
    type: String,
    example: '17011584',
  })
  studentId!: string;

  @IsString()
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  password!: string;
}
