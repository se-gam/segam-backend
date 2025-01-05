import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

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

  @ApiProperty({
    description: '공지사항 팝업 여부',
    example: false,
    type: Boolean,
  })
  @IsBoolean()
  isPopup!: boolean;
}
