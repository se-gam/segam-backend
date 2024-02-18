import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PasswordService } from 'src/common/services/password.service';
import { AttendanceRepository } from './attendance.repository';
import { AssignmentAttendanceListDto } from './dto/assignment-attendance.dto';
import { CourseAttendanceListDto } from './dto/course-attendace-list.dto';
import { CourseAttendanceDto } from './dto/course-attendance.dto';
import { LectureAttendanceListDto } from './dto/lecture-attendance.dto';
import { EcampusService } from './ecampus.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly ecampusService: EcampusService,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async getCourseAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<CourseAttendanceListDto> {
    if (payload.password) {
      // TODO: 이거 굉장히 별로임
      if (this.configService.get('NODE_ENV') !== 'local') {
        payload.password = this.passwordService.decryptPassword(
          payload.password,
        );
      }
      await this.ecampusService.updateUserAttendance(user, payload);
    }

    const courses =
      await this.attendanceRepository.getCourseAttendanceList(user);

    return CourseAttendanceListDto.from(courses);
  }

  async getCourseAttendanceByEcampusId(
    user: UserInfo,
    payload: PasswordPayload,
    ecampusId: number,
  ): Promise<CourseAttendanceDto> {
    if (payload.password) {
      // TODO: 이거 굉장히 별로임
      if (this.configService.get('NODE_ENV') !== 'local') {
        payload.password = this.passwordService.decryptPassword(
          payload.password,
        );
      }
      await this.ecampusService.updateUserAttendance(user, payload);
    }
    const course =
      await this.attendanceRepository.getCourseAttendanceByEcampusId(
        user,
        ecampusId,
      );

    if (!course) {
      throw new NotFoundException('해당 강좌를 찾을 수 없습니다');
    }
    return CourseAttendanceDto.from(course);
  }

  async getLectureAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<LectureAttendanceListDto> {
    if (payload.password) {
      // TODO: 이거 굉장히 별로임
      if (this.configService.get('NODE_ENV') !== 'local') {
        payload.password = this.passwordService.decryptPassword(
          payload.password,
        );
      }
      await this.ecampusService.updateUserAttendance(user, payload);
    }
    const lectures =
      await this.attendanceRepository.getLectureAttendanceList(user);
    return LectureAttendanceListDto.from(lectures);
  }

  async getAssignmentAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<AssignmentAttendanceListDto> {
    if (payload.password) {
      // TODO: 이거 굉장히 별로임
      if (this.configService.get('NODE_ENV') !== 'local') {
        payload.password = this.passwordService.decryptPassword(
          payload.password,
        );
      }
      await this.ecampusService.updateUserAttendance(user, payload);
    }
    const assignments =
      await this.attendanceRepository.getAssignmentAttendanceList(user);
    return AssignmentAttendanceListDto.from(assignments);
  }
}
