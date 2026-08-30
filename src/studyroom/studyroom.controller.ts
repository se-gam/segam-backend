import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { AdminApiGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { PasswordValidationPipe } from 'src/auth/pipes/signup-validation.pipe';
import { UserInfo } from 'src/auth/types/user-info.type';
import { StudyroomInfoListDto } from './dto/studyroom-infp.dto';
import { StudyroomReservationListDto } from './dto/studyroom-reservation.dto';
import { StudyroomDto, StudyroomListDto } from './dto/studyroom.dto';
import { StudyroomCancelPayload } from './payload/studyroomCancel.payload';
import { StudyroomReservePayload } from './payload/studyroomReserve.payload';
import { StudyroomUpdatePayload } from './payload/studyroomUpdate.payload';
import { StudyroomUserPayload } from './payload/studyroomUserPayload.payload';
import { StudyroomQuery } from './query/studyroom.query';
import { StudyroomDateQuery } from './query/studyroomDateQuery.query';
import { StudyroomService } from './studyroom.service';

@ApiTags('스터디룸 API')
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
  @ApiNotFoundResponse({
    description: '해당 id의 스터디룸을 찾을 수 없습니다.',
  })
  @Get(':id')
  async getStudyroomById(
    @Param('id') id: number,
    @Query() query: StudyroomDateQuery,
  ): Promise<StudyroomDto> {
    return this.studyroomService.getStudyroomById(id, query);
  }

  @Version('1')
  @ApiOperation({
    summary: '예약 목록 조회 API',
    description: '내가 예약한 스터디룸 목록을 가져옵니다.',
  })
  @ApiCreatedResponse({
    type: StudyroomReservationListDto,
    description: '예약 목록 조회 성공',
  })
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation/me')
  async getStudyroomReservations(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<StudyroomReservationListDto> {
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
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    description: '예약 실패 - 날짜 중복 혹은 동반자 중복 등록',
  })
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation')
  async reserveStudyroom(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: StudyroomReservePayload,
  ): Promise<void> {
    return this.studyroomService.reserveStudyroom(user.studentId, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '예약 취소 API',
    description: 'id에 해당하는 예약을 취소합니다.',
  })
  @ApiCreatedResponse()
  @ApiBadRequestResponse({
    description:
      '현재 스터디룸 예약 내역이 없습니다. | 예약 취소는 예약자만 가능합니다',
  })
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @ApiNotFoundResponse({
    description: '해당 id의 예약이 존재하지 않습니다 | 예약을 찾을 수 없습니다',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('reservation/cancel/:id')
  async cancelStudyroomReservation(
    @Param('id') id: number,
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: StudyroomCancelPayload,
  ): Promise<void> {
    return this.studyroomService.cancelStudyroomReservation(
      id,
      user.studentId,
      payload,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: '스터디룸 친구 추가 API',
    description: '외부 포털 확인 없이 친구를 등록합니다.',
  })
  @ApiCreatedResponse({ description: '친구 추가 성공' })
  @ApiBadRequestResponse({
    description: '이미 친구로 등록된 사용자이거나 자기 자신입니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('user')
  async addUserAsFriend(
    @CurrentUser() user: UserInfo,
    @Body() payload: StudyroomUserPayload,
  ): Promise<void> {
    await this.studyroomService.addUserAsFriend(user, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 정보 업데이트 API',
    description: '스터디룸 정보를 업데이트 합니다.',
  })
  @ApiOkResponse({
    description: '스터디룸 정보 업데이트 성공',
  })
  @ApiNotFoundResponse({
    description: '해당 id의 스터디룸을 찾을 수 없습니다.',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Patch('info/:id')
  async updateStudyroom(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: StudyroomUpdatePayload,
  ): Promise<void> {
    return this.studyroomService.updateStudyroom(id, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '[어드민] 스터디룸 정보 목록 조회 API',
    description: '스터디룸 정보 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '스터디룸 정보 목록 조회 성공',
  })
  @UseGuards(AdminApiGuard)
  @ApiHeader({
    name: 'admin-api-key',
    description: 'API key for admin access',
    required: true,
  })
  @Get('info/all')
  async getAllStudyroomInfo(): Promise<StudyroomInfoListDto> {
    return this.studyroomService.getAllStudyroomInfo();
  }
}
