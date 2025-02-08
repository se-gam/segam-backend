import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NoticeDto } from './dto/notice.dto';
import { NoticeService } from './notice.service';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';
import { NoticePreviewDto } from './dto/notice-preview.dto';
import { AdminApiGuard } from 'src/auth/guard/admin.guard';

@ApiTags('공지사항 API')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Version('1')
  @ApiOperation({
    summary: '팝업 공지사항 조회 API',
    description: '팝업 공지사항을 조회합니다.',
  })
  @Get('popup')
  async getPopupNotice(): Promise<NoticeDto> {
    return this.noticeService.getPopupNotice();
  }

  @Version('1')
  @ApiOperation({
    summary: '팝업 공지사항 등록 API',
    description: '팝업 공지사항을 등록합니다.',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Post('popup/:id')
  async createPopupNotice(@Param('id') id: number): Promise<void> {
    return this.noticeService.createPopupNotice(id);
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 생성 API',
    description: '공지사항을 생성합니다.',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
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
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Put(':id')
  async updateNotice(
    @Param('id') id: number,
    @Body() payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    return this.noticeService.updateNotice(id, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항을 삭제합니다.',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Delete(':id')
  async deleteNotice(@Param('id') id: number): Promise<void> {
    return this.noticeService.deleteNotice(id);
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 조회 api',
    description: '공지사항을 조회합니다.',
  })
  @ApiOkResponse({
    description: '전체 공지사항의 id, title, createdAt 필드를 조회합니다.',
    type: [NoticePreviewDto],
  })
  @Get()
  async getNotice(): Promise<NoticePreviewDto[]> {
    return this.noticeService.getNotice();
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 단일조회 api',
    description: '특정 공지사항을 조회합니다.',
  })
  @ApiOkResponse({
    type: NoticeDto,
  })
  @Get('/:id')
  async getNoticeById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NoticeDto> {
    return this.noticeService.getNoticeById(id);
  }
}
