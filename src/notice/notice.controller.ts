import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NoticeDto } from './dto/notice.dto';
import { NoticeService } from './notice.service';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';

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

  @Version('1')
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '공지사항을 생성합니다.',
  })
  @Post('')
  async createNotice(
    @Body() payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    return this.noticeService.createNotice(payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 수정 API',
    description: '공지사항을 수정합니다.',
  })
  @Put(':id')
  async updateNotice(
    @Param('id') id: number,
    @Body() payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    return this.noticeService.updateNotice(id, payload);
  }
}
