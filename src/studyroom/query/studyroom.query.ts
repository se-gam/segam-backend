import { Optional } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class StudyroomQuery {
  @Type(() => Date)
  @IsDate()
  @Optional()
  date: Date = new Date();

  @Type(() => Number)
  @IsInt()
  timeGte: number = 10;

  @Type(() => Number)
  @IsInt()
  timeLte: number = 10;

  @Type(() => Number)
  @IsInt()
  userCount: number = 3;
}
