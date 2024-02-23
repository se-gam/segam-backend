import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class StudyroomUserPayload {
  @ApiProperty({
    description: '비밀번호',
    type: String,
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description: '조회할 user id',
    type: String,
  })
  @IsString()
  friendId!: string;

  @ApiProperty({
    description: '예약 날짜 (예: 2024-02-28 or 2024-02-28T10:13:09.004Z)',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  date!: Date;
}
