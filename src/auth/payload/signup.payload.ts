import { ApiProperty } from '@nestjs/swagger';
import { OS } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

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

  @IsEnum(OS)
  @ApiProperty({
    description: '사용사 기기 OS',
    enum: OS,
  })
  os!: OS;

  @IsString()
  @ApiProperty({
    description: 'FCM푸쉬 토큰',
    type: String,
  })
  pushToken!: string;
}
