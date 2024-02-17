import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenPayload {
  @IsString()
  @ApiProperty({
    description: '리프레시 토큰',
    type: String,
  })
  refreshToken!: string;
}
