import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class PaginationPayload {
  @ApiPropertyOptional({
    description: '앞에서부터 n개의 데이터를 생락합니다.',
    example: 5,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  skip?: number;

  @ApiPropertyOptional({
    description: 'skip된 직후의 n개의 데이터를 요청합니다.',
    example: 5,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  take?: number;
}
