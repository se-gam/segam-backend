import { ApiProperty } from '@nestjs/swagger';

export class GodokBookDto {
  @ApiProperty({
    description: '고전독서 도서 id',
    example: 3003,
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '고전독서 도서 이름',
    example: '췍',
    type: String,
  })
  bookName!: string;

  @ApiProperty({
    description: '고전독서 영역 id',
    example: 3000,
    type: Number,
  })
  categoryId!: number;

  @ApiProperty({
    description: '고전독서 영역 이름',
    example: '동서양의 문학',
    type: String,
  })
  categoryName!: string;

  @ApiProperty({
    description: '고전독서 도서 저자',
    example: '김췍',
    type: String,
  })
  author!: string;

  @ApiProperty({
    description: '고전독서 도서 출판사',
    example: '췍출판사',
    type: String,
  })
  publisher!: string;
}
