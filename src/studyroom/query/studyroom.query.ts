import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class StudyroomQuery {
  @Type(() => Date)
  @IsDate()
  @Optional()
  date?: Date = new Date();

  @Type(() => Number)
  @IsInt()
  @Optional()
  timeGte?: number = 10;

  @Type(() => Number)
  @IsInt()
  @Optional()
  timeLt?: number = 22;

  @Type(() => Number)
  @IsInt()
  @Optional()
  userCount?: number = 3;
}
