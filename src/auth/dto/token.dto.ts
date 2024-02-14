import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: '액세스 토큰',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: '리프레시 토큰',
    type: String,
  })
  refreshToken!: string;
}
