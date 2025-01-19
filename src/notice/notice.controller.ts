import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NoticeDto } from './dto/notice.dto';
import { NoticeService } from './notice.service';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';
import { PaginationPayload } from './payload/pagination.payload';

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
  @Post('popup/:id')
  async createPopupNotice(@Param('id') id: number): Promise<void> {
    return this.noticeService.createPopupNotice(id);
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

  @Version('1')
  @ApiOperation({
    summary: '공지사항 삭제 API',
    description: '공지사항을 삭제합니다.',
  })
  @Delete(':id')
  async deleteNotice(@Param('id') id: number): Promise<void> {
    return this.noticeService.deleteNotice(id);
  }

  @Version('1')
  @ApiOperation({
    summary: '공지사항 조회 api',
    description:
      '{skip}개 이후의 데이터를 {take}개 요청합니다. \n 아무런 queryData도 보내지 않을 경우 전부 가져옵니다.',
  })
  @ApiOkResponse({
    description: '전체 공지사항 목록을 반환합니다 (쿼리 파라미터가 없는 경우).',
    type: [NoticeDto],
  })
  @Get()
  async getNotice(
    @Query() queryData: PaginationPayload,
  ): Promise<NoticeDto[] | Partial<NoticeDto>[]> {
    console.log(queryData);
    if (queryData.skip == undefined && queryData.take == undefined) {
      return this.noticeService.getNotice();
    }
    return this.noticeService.getNoticeByPagination({
      skip: queryData.skip,
      take: queryData.take,
    });
  }
}
