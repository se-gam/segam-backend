import { Optional } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class StudyroomQuery {
  @ApiPropertyOptional({
    type: Date,
    description: '선택 날짜(default: 오늘)',
  })
  @Type(() => Date)
  @IsDate()
  @Optional()
  date?: Date = new Date();
}
