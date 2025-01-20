import { ApiProperty } from '@nestjs/swagger';
import { Notice } from '@prisma/client';

export class NoticePreviewDto {
  @ApiProperty({
    description: '공지사항 id',
    example: 1,
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '공지사항 제목',
    example: '공지사항 제목',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '공지사항 생성 일자',
    type: Date,
  })
  createdAt!: Date;

  static from(notice: Notice): NoticePreviewDto {
    return {
      id: notice.id,
      title: notice.title,
      createdAt: notice.createdAt,
    };
  }
}
