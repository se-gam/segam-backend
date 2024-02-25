import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PushTokenPayload {
  @IsString()
  @ApiProperty({
    description: '푸시 토큰',
    type: String,
  })
  pushToken!: string;
}
