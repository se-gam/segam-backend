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
    return [
      {
        reservationId: 1,
        bookId: 3003,
        bookName: '췍',
        reservationTime: new Date(),
      },
    ];
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('reservation')
  async reserveGodok(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: GodokReservePayload,
  ): Promise<void> {
    return;
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
    @Param('reservationId') reservationId: number,
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<void> {
    return;
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
    return {
      status: true,
      categoryStatus: [
        {
          categoryCode: 1000,
          categoryName: '동양의 역사와 사상',
          categoryStatus: false,
          count: 2,
        },
        {
          categoryCode: 2000,
          categoryName: '서양의 역사와 사상',
          categoryStatus: false,
          count: 2,
        },
        {
          categoryCode: 3000,
          categoryName: '동서양의 문학',
          categoryStatus: false,
          count: 0,
        },
        {
          categoryCode: 4000,
          categoryName: '과학 사상',
          categoryStatus: true,
          count: 1,
        },
      ],
    } as GodokStatusDto;
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
    return [
      {
        bookId: 3003,
        bookName: '췍',
        categoryId: 3000,
        categoryName: '동서양의 문학',
        author: '김췍',
        publisher: '췍출판사',
      },
    ];
  }
}
