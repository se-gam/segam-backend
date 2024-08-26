import { ApiProperty } from '@nestjs/swagger';
import { GodokCategoryStatus, GodokStatus } from '../types/godokStatus.type';
import { count } from 'console';

class GodokCategoryStatusDto {
  @ApiProperty({
    description: '영역 코드',
    example: 3000,
    type: Number,
  })
  categoryCode!: number;

  @ApiProperty({
    description: '영역명',
    example: '동서양의 문학',
    type: String,
  })
  categoryName!: string;

  @ApiProperty({
    description: '영역 인증 여부',
    example: false,
    type: Boolean,
  })
  categoryStatus!: boolean;

  @ApiProperty({
    description: '인증 권수',
    example: 2,
    type: Number,
  })
  count!: number;

  @ApiProperty({
    description: '목표 권수',
    example: 4,
    type: Number,
  })
  targetCount!: number;

  static from(status: GodokCategoryStatus): GodokCategoryStatusDto {
    return {
      categoryCode: status.categoryCode,
      categoryName: status.categoryName,
      categoryStatus: status.categoryStatus,
      count: status.count,
      targetCount: status.targetCount,
    };
  }
}

export class GodokStatusDto {
  @ApiProperty({
    description: '인증 여부',
    example: false,
    type: Boolean,
  })
  status!: boolean;

  @ApiProperty({
    description: '영역별 인증 권수',
    type: [GodokCategoryStatusDto],
  })
  categoryStatus!: GodokCategoryStatusDto[];

  static from(status: GodokStatus): GodokStatusDto {
    return {
      status: status.status,
      categoryStatus: status.categoryStatus.map((status) =>
        GodokCategoryStatusDto.from(status),
      ),
    };
  }
}
