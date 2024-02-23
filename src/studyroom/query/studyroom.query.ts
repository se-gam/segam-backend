import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class StudyroomQuery {
  @ApiPropertyOptional({
    type: Date,
    description: '선택 날짜(deafult: 오늘)',
  })
  @Type(() => Date)
  @IsDate()
  @Optional()
  date?: Date = new Date();

  @ApiPropertyOptional({
    type: Number,
    description: '최소시간(deafult: 10)',
  })
  @Type(() => Number)
  @IsInt()
  @Optional()
  timeGte?: number = 10;

  @ApiPropertyOptional({
    type: Number,
    description: '최대시간(deafult: 22)',
  })
  @Type(() => Number)
  @IsInt()
  @Optional()
  timeLt?: number = 22;

  @ApiPropertyOptional({
    type: Number,
    description: '인원수(deafult: 3)',
  })
  @Type(() => Number)
  @IsInt()
  @Optional()
  userCount?: number = 3;
}
