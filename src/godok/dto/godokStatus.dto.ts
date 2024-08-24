import { ApiProperty } from '@nestjs/swagger';

class GodokAreaStatusDto {
  @ApiProperty({
    description: '영역 코드',
    example: 3000,
    type: Number,
  })
  areaCode!: number;

  @ApiProperty({
    description: '영역명',
    example: '동서양의 문학',
    type: String,
  })
  areaName!: string;

  @ApiProperty({
    description: '영역 인증 여부',
    example: false,
    type: Boolean,
  })
  areaStatus!: boolean;

  @ApiProperty({
    description: '인증 권수',
    example: 2,
    type: Number,
  })
  count!: number;
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
    type: GodokAreaStatusDto,
  })
  areaStatus!: GodokAreaStatusDto[];
}
