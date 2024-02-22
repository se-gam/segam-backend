import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { PasswordValidationPipe } from 'src/auth/pipes/signup-validation.pipe';
import { UserInfo } from 'src/auth/types/user-info.type';
import { AttendanceService } from './attendance.service';
import { AssignmentAttendanceListDto } from './dto/assignment-attendance.dto';
import { CourseAttendanceListDto } from './dto/course-attendace-list.dto';
import { CourseAttendanceDto } from './dto/course-attendance.dto';
import { LectureAttendanceListDto } from './dto/lecture-attendance.dto';

@ApiTags('출석 API')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Version('1')
  @Post('update')
  @ApiOperation({ summary: '출석 정보 업데이트' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateCourseAttendance(
    @CurrentUser() user: UserInfo,
    @Body(PasswordValidationPipe) payload: PasswordPayload,
  ): Promise<void> {
    return this.attendanceService.updateCourseAttendance(user, payload);
  }

  @Version('1')
  @Get('course')
  @ApiOperation({ summary: '과목별 출결 현황' })
  @ApiCreatedResponse({ type: CourseAttendanceListDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCourseAttendance(
    @CurrentUser() user: UserInfo,
  ): Promise<CourseAttendanceListDto> {
    return this.attendanceService.getCourseAttendance(user);
  }

  @Version('1')
  @Get('course/:ecampusId')
  @ApiOperation({ summary: '과목 출결 현황' })
  @ApiCreatedResponse({ type: CourseAttendanceDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getCourseAttendanceById(
    @CurrentUser() user: UserInfo,
    @Param('ecampusId', ParseIntPipe) ecampusId: number,
  ): Promise<CourseAttendanceDto> {
    return this.attendanceService.getCourseAttendanceByEcampusId(
      user,
      ecampusId,
    );
  }

  @Version('1')
  @Get('lecture')
  @ApiOperation({ summary: '강의별 출결 현황' })
  @ApiCreatedResponse({ type: LectureAttendanceListDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getLectureAttendance(
    @CurrentUser() user: UserInfo,
  ): Promise<LectureAttendanceListDto> {
    return this.attendanceService.getLectureAttendance(user);
  }

  @Version('1')
  @Get('assignment')
  @ApiOperation({ summary: '과제별 출결 현황' })
  @ApiCreatedResponse({ type: AssignmentAttendanceListDto })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAssignmentAttendance(
    @CurrentUser() user: UserInfo,
  ): Promise<AssignmentAttendanceListDto> {
    return this.attendanceService.getAssignmentAttendance(user);
  }
}
