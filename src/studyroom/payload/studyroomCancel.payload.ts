import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PasswordPayload } from 'src/auth/payload/password.payload';

export class StudyroomCancelPayload extends PasswordPayload {
  @ApiPropertyOptional({
    description: '취소이유',
    type: String,
  })
  @Optional()
  @IsString()
  cancelReason?: string;
}
