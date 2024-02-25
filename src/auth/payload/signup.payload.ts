import { ApiProperty } from '@nestjs/swagger';
import { OS } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PasswordPayload } from './password.payload';

export class SignUpPayload extends PasswordPayload {
  @IsString()
  @ApiProperty({
    description: '학번',
    type: String,
    example: '17011584',
  })
  studentId!: string;

  @IsEnum(OS)
  @IsOptional()
  @ApiProperty({
    description: '사용사 기기 OS',
    enum: OS,
  })
  os?: OS;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'FCM푸쉬 토큰',
    type: String,
  })
  pushToken?: string;
}
