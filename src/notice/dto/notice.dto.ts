import { ApiProperty } from '@nestjs/swagger';
import { Notice } from '@prisma/client';

export class NoticeDto {
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
    description: '공지사항 내용',
    example: '공지사항 내용',
    type: String,
  })
  content!: string;

  @ApiProperty({
    description: '팝업 공지사항 여부',
    example: false,
    type: Boolean,
  })
  isPopup!: boolean;

  @ApiProperty({
    description: '공지사항 생성 일자',
    type: Date,
  })
  createdAt!: Date;

  @ApiProperty({
    description: '공지사항 삭제 일자',
    type: Date,
  })
  deletedAt?: Date;

  static from(notice: Notice): NoticeDto {
    return {
      id: notice.id,
      title: notice.title,
      content: notice.content,
      isPopup: notice.isPopup,
      createdAt: notice.createdAt,
      deletedAt: notice.deletedAt,
    };
  }
}
