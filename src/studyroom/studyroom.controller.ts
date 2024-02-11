import { Controller, Get, Param, Query } from '@nestjs/common';
import { StudyroomService } from './studyroom.service';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';

@Controller('studyroom')
export class StudyroomController {
  constructor(private readonly studyroomService: StudyroomService) {}

  @Get()
  async getAllStudyrooms(
    @Query() query: StudyroomQuery,
  ): Promise<StudyroomListDto> {
    return this.studyroomService.getAllStudyrooms(query);
  }

  @Get(':id')
  async getStudyroomById(@Param('id') id: number): Promise<StudyroomDto> {
    return this.studyroomService.getStudyroomById(id);
  }
}
