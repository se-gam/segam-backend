import { Controller, Get, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NoticeDto } from './dto/notice.dto';
import { NoticeService } from './notice.service';

@ApiTags('공지사항 API')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Version('1')
  @ApiOkResponse({ type: [NoticeDto] })
  @ApiOperation({
    summary: '공지사항 조회 API',
    description: '공지사항을 조회합니다.',
  })
  @Get('')
  async getNotice(): Promise<NoticeDto[]> {
    return this.noticeService.getNotice();
  }
}
