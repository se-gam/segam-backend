import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StudyroomService } from './studyroom.service';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomReservatoinListDto } from './dto/studyroomReservation.dto';
import { UserInfoPayload } from 'src/user/payload/UserInfoPayload.payload';

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

  @Post('reservation/me')
  async getStudyroomReservations(
    @Body() payload: UserInfoPayload,
  ): Promise<StudyroomReservatoinListDto> {
    return this.studyroomService.getStudyroomReservations(payload);
  }
}
