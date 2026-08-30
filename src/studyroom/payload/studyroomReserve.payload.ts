import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { PasswordPayload } from 'src/auth/payload/password.payload';

export class StudyroomReservePayload extends PasswordPayload {
  @ApiProperty({
    description: '스터디룸 id',
    type: Number,
  })
  @Type(() => Number)
  @IsNumber()
  studyroomId: number;

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
  @Min(1)
  @Max(2)
  duration: number;

  @ApiProperty({
    description: '동반인 학번 목록',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  users: string[];

  @ApiProperty({
    description: '예약 사유입니다. 외부 예약 API에는 전달하지 않습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
