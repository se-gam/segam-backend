import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class StudyroomCancelPayload {
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    description: '취소이유',
    type: String,
  })
  @Optional()
  @IsString()
  cancelReason?: string;
}
