import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { PasswordValidationPipe } from 'src/auth/pipes/signup-validation.pipe';
import { UserInfo } from 'src/auth/types/user-info.type';
import { GodokBookDto } from './dto/godok-book.dto';
import { GodokReservationDto } from './dto/godok-reservation.dto';
import { GodokSlotListDto } from './dto/godok-slot.dto';
import { GodokStatusDto } from './dto/godok-status.dto';
import { GodokService } from './godok.service';
import { GodokReservePayload } from './payload/godokReserve.payload';

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
  @Get('calendar')
  async getGodokCalendar(): Promise<GodokSlotListDto> {
    return this.godokService.getGodokCalendar();
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 예약 목록 조회 API',
    description: '내가 예약한 고전독서 예약 목록을 가져옵니다.',
  })
  @ApiCreatedResponse({
    type: [GodokReservationDto],
    description: '고전독서 예약 목록 조회 성공',
  })
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reservation/me')
  async getGodokReservations(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<GodokReservationDto[]> {
    return this.godokService.getUserReservations(user.studentId, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 예약 API',
    description: '고전독서 시험을 예약합니다.',
  })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @ApiBadRequestResponse({
    description: '예약 실패',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reservation')
  async reserveGodok(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: GodokReservePayload,
  ): Promise<void> {
    return this.godokService.reserveGodok(user.studentId, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 예약 취소 API',
    description: 'reservationId에 해당하는 예약을 취소합니다.',
  })
  @ApiCreatedResponse()
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    description: '예약 id',
    name: 'reservationId',
    example: 'OPAP-0000197302',
  })
  @Post('reservation/cancel/:reservationId')
  async cancelGodokReservation(
    @Param('reservationId') reservationId: string,
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<void> {
    return this.godokService.cancelReservation(
      user.studentId,
      payload,
      reservationId,
    );
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 인증 현황 조회 API',
    description: '내 고전독서 인증 현황을 조회합니다.',
  })
  @ApiCreatedResponse({
    type: GodokStatusDto,
    description: '고전독서 인증 현황 조회 성공',
  })
  @ApiUnauthorizedResponse({
    description: '포털 로그인 실패',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('status/me')
  async getGodokStatus(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<GodokStatusDto> {
    return this.godokService.getUserStatus(user.studentId, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 도서 목록 조회 API',
    description: '고전독서 도서 목록을 조회합니다.',
  })
  @ApiOkResponse({
    description: '고전독서 도서 목록 조회 성공',
    type: [GodokBookDto],
  })
  @Get('books')
  async getGodokBooks(): Promise<GodokBookDto[]> {
    return this.godokService.getGodokBooks();
  }

  @Version('1')
  @ApiOperation({
    summary: '고전독서 도서 목록 업데이트 API',
    description: '고전독서 도서 목록을 업데이트합니다.',
  })
  @Get('books-update')
  async updateGodokBooks(): Promise<void> {
    return this.godokService.updateGodokBooks();
  }
}
