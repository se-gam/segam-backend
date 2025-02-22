import { Body, Controller, Get, Post, UseGuards, Version } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BatchService } from './batch.service';
import { StudyroomBatchInfoDto } from './dto/studyroomBatchInfo.dto';
import { CronTimePayload } from './payload/cron-time.payload';
import { AdminApiGuard } from 'src/auth/guard/admin.guard';

@ApiTags('배치 API')
@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 슬롯 크롤러 배치 정보 조회 API',
    description: '스터디룸 슬롯 크롤러 배치 정보 조회 API',
  })
  @ApiOkResponse({ type: StudyroomBatchInfoDto })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Get('studyroom')
  async getStudyroom() {
    return this.batchService.getStudyroomBatchInfo();
  }

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 슬롯 크롤러 배치 활성화 API',
    description: '스터디룸 슬롯 크롤러 배치 활성화 API',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Post('studyroom/activate')
  async activateStudyroomSlotCrawler() {
    return this.batchService.activateStudyroomSlotCrawler();
  }

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 슬롯 크롤러 배치 비활성화 API',
    description: '스터디룸 슬롯 크롤러 배치 비활성화 API',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Post('studyroom/deactivate')
  async deactivateStudyroomSlotCrawler() {
    return this.batchService.deactivateStudyroomSlotCrawler();
  }

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 슬롯 크롤러 배치 크론 시간 변경 API',
    description: '스터디룸 슬롯 크롤러 배치 크론 시간 변경 API',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Post('studyroom/cron-time')
  async changeStudyroomSlotCrawlerCronTime(@Body() body: CronTimePayload) {
    return this.batchService.changeStudyroomSlotCrawlerCronTime(body.cronTime);
  }
}
