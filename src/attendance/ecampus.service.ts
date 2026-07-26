import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { UserInfo } from 'src/auth/types/user-info.type';
import { ExternalApiService } from 'src/common/services/external-api.service';
import { AttendanceRepository } from './attendance.repository';
import { RawCourse } from './types/raw-course';

@Injectable()
export class EcampusService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly externalApiService: ExternalApiService,
  ) {}

  async updateUserAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<void> {
    const response = await this.externalApiService.fetchCourseAttendance({
      studentId: user.studentId,
      name: user.name,
      password: payload.password,
    });

    if (response.status === 500) {
      throw new InternalServerErrorException('출석 업데이트 람다 함수 오류');
    }
    if (response.status === 401) throw new UnauthorizedException('로그인 실패');
    if (response.status === 400)
      throw new BadRequestException(
        '강의 정보를 가져오는데 실패했습니다. 다시 시도해주세요.',
      );

    const courses = JSON.parse(response.data) as RawCourse[];

    await this.attendanceRepository.updateUserAttendance(user, courses);
  }
}
