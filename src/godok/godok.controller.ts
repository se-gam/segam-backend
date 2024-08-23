import {
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { PasswordValidationPipe } from 'src/auth/pipes/signup-validation.pipe';
import { UserInfo } from 'src/auth/types/user-info.type';
import { GodokReservationDto } from './dto/godokReservation.dto';
import { GodokStatusDto } from './dto/godokStatus.dto';
import { GodokService } from './godok.service';
import { GodokCancelPayload } from './payload/godokCancel.payload';
import { GodokReservePayload } from './payload/godokReserve.payload';

@ApiTags('고전독서 API')
@Controller('godok')
export class GodokController {
  constructor(private readonly godokService: GodokService) {}

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
  @Post('reservation/cancel/:id')
  async cancelGodokReservation(
    @Param('reservationId') id: number,
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: GodokCancelPayload,
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
      areaStatus: [
        {
          areaCode: 1000,
          areaName: '동양의 역사와 사상',
          areaStatus: false,
          count: 2,
        },
        {
          areaCode: 2000,
          areaName: '서양의 역사와 사상',
          areaStatus: false,
          count: 2,
        },
        {
          areaCode: 3000,
          areaName: '동서양의 문학',
          areaStatus: false,
          count: 0,
        },
        {
          areaCode: 4000,
          areaName: '과학 사상',
          areaStatus: true,
          count: 1,
        },
      ],
    } as GodokStatusDto;
  }
}
