import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class StudyroomDateQuery {
  @ApiProperty({
    type: Date,
    description: '선택 날짜',
  })
  @Type(() => Date)
  @IsDate()
  date!: Date;
}
