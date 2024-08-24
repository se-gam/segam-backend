import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PasswordPayload } from 'src/auth/payload/password.payload';

export class GodokCancelPayload extends PasswordPayload {
  @ApiProperty({
    description: '고전독서 시험예약 id',
    example: 'OPAP-0000197302',
    type: String,
  })
  @IsString()
  reservationId: string;
}
