import { ApiProperty } from '@nestjs/swagger';
import { GodokBook } from '../types/godokBook.type';

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

  static from(books: GodokBook[]) {
    return books.map((book) => {
      return {
        bookId: book.id,
        bookName: book.title,
        categoryId: book.bookCategoryId,
        categoryName: book.bookCategory.name,
      };
    });
  }
}
