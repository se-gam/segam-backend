import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsInt, IsString, isInt } from 'class-validator';

export class StudyroomQuery {
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @Type(() => Number)
  @IsInt()
  timeGte!: number;

  @Type(() => Number)
  @IsInt()
  timeLte!: number;

  @Type(() => Number)
  @IsInt()
  userCount!: number;
}
