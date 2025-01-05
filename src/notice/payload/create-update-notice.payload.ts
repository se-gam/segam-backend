import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUpdateNoticePayload {
  @ApiProperty({
    description: '공지사항 제목',
    example: '공지사항 제목',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: '공지사항 내용',
    example: '공지사항 내용',
  })
  @IsString()
  content!: string;
}
