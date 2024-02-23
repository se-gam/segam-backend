import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/auth/types/user-info.type';
import { UserInfoPayload } from 'src/user/payload/UserInfoPayload.payload';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomReservatoinListDto } from './dto/studyroomReservation.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomService } from './studyroom.service';

@ApiTags('studyroom')
@Controller('studyroom')
export class StudyroomController {
  constructor(private readonly studyroomService: StudyroomService) {}

  @Version('1')
  @ApiOperation({
    summary: '스터디룸 목록 조회 API',
    description:
      '스터디룸 모든 목록을 가져옵니다. 쿼리를 통해 날짜, 시간, 인원수를 선택가능합니다. ',
  })
  @ApiOkResponse({ type: StudyroomListDto })
  @Get()
  async getAllStudyrooms(
    @Query() query: StudyroomQuery,
  ): Promise<StudyroomListDto> {
    return this.studyroomService.getAllStudyrooms(query);
  }

  @Version('1')
  @ApiOperation({
    summary: '스터디룸 단건 조회 API',
    description: 'id에 해당하는 스터디룸 정보를 가져옵니다.',
  })
  @ApiOkResponse({ type: StudyroomDto })
  @Get(':id')
  async getStudyroomById(@Param('id') id: number): Promise<StudyroomDto> {
    return this.studyroomService.getStudyroomById(id);
  }

  @Version('1')
  @ApiOperation({
    summary: '예약 목록 조회 API',
    description: '내가 예약한 스터디룸 목록을 가져옵니다.',
  })
  @ApiOkResponse({ type: StudyroomReservatoinListDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation/me')
  async getStudyroomReservations(
    @CurrentUser() user: UserInfo,
    @Body() payload: UserInfoPayload,
  ): Promise<StudyroomReservatoinListDto> {
    return this.studyroomService.getStudyroomReservations(
      user.studentId,
      payload,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: '예약 API',
    description: 'id에 해당하는 스터디룸을 예약합니다.',
  })
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation')
  async reserveStudyroom(
    @CurrentUser() user: UserInfo,
    @Body() payload: StudyroomReservePayload,
  ): Promise<void> {
    return this.studyroomService.reserveStudyroom(user.studentId, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '예약 취소 API',
    description: 'id에 해당하는 예약을 취소합니다.',
  })
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation/cancel/:id')
  async cancelStudyroomReservation(
    @Param('id') id: number,
    @CurrentUser() user: UserInfo,
    @Body() payload: StudyroomCancelPayload,
  ): Promise<void> {
    return this.studyroomService.cancelStudyroomReservation(
      id,
      user.studentId,
      payload,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: '스터디룸 인원 추가 확인 API',
    description: '추가 가능한 친구인지 확인합니다.',
  })
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('user')
  async checkUserAvailablity(
    @CurrentUser() user: UserInfo,
    @Body() payload: StudyroomUserPayload,
  ): Promise<void> {
    return this.studyroomService.checkUserAvailablity(user.studentId, payload);
  }
}
