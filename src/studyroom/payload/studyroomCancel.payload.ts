import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { number } from 'joi';

export class StudyroomCancelPayload {
  @IsString()
  studentId!: string;

  @IsString()
  password!: string;

  @Optional()
  cancelReason?: string;
}
