import { ApiProperty } from '@nestjs/swagger';
import { OS } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class PushTokenPayload {
  @IsString()
  @ApiProperty({
    description: '푸시 토큰',
    type: String,
  })
  pushToken!: string;

  @IsEnum(OS)
  @ApiProperty({
    description: 'OS',
    enum: OS,
  })
  os!: OS;
}
