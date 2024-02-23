import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class StudyroomReservePayload {
  @ApiProperty({
    description: '스터디룸 id',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  studyroomId: number;

  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description: '날짜 (예: 2024-02-28 or 2024-02-28T10:13:09.004Z)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({
    description: '시작시간 (예: 10:00 -> 10)',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  startsAt: number;

  @ApiProperty({
    description: '기간 (예: 1시간 -> 1, 2시간 -> 2)',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: '예약 이유',
    type: String,
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: '동반인 id',
    type: [String],
  })
  @IsString({ each: true })
  users: string[];
}
