import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { PasswordPayload } from 'src/auth/payload/password.payload';

export class GodokReservePayload extends PasswordPayload {
  @ApiProperty({
    description: '고전독서시험 슬롯 id',
    example: 'SCHU_24051314224746943',
    type: String,
  })
  @IsString()
  godokSlotId: string;

  @ApiProperty({
    description: '영역 코드',
    example: 3000,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  bookAreaCode: number;

  @ApiProperty({
    description: '책 코드',
    example: 3003,
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  bookCode: number;
}
