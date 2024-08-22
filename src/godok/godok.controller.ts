import { Controller, Get, Version } from '@nestjs/common';
import { GodokService } from './godok.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GodokSlotListDto } from './dto/godok-slot.dto';

@ApiTags('고전독서 API')
@Controller('godok')
export class GodokController {
  constructor(private readonly godokService: GodokService) {}

  @Version('1')
  @ApiOkResponse({ type: GodokSlotListDto })
  @ApiOperation({
    summary: '고전독서 캘린더 조회 API',
    description: '고전독서 한달 캘린더를 조회합니다.',
  })
  @Get()
  async getGodokCalendar(): Promise<GodokSlotListDto> {
    return this.godokService.getGodokCalendar();
  }
}
