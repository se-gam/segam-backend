import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class StudyroomUserPayload {
  @ApiProperty({
    description: '추가할 친구의 학번입니다.',
    example: '20260002',
  })
  @IsString()
  friendId!: string;

  @ApiProperty({
    description: '추가할 친구의 이름입니다.',
    example: '친구',
  })
  @IsString()
  friendName!: string;

  @ApiPropertyOptional({
    description: '이전 클라이언트 호환용 비밀번호입니다. 사용하지 않습니다.',
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: '이전 클라이언트 호환용 예약 날짜입니다. 사용하지 않습니다.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
