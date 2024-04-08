import * as _ from 'lodash';

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { parse } from 'node-html-parser';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { UserInfo } from 'src/auth/types/user-info.type';
import { AxiosService } from 'src/common/services/axios.service';
import { DiscordService } from 'src/common/services/discord.service';
import { AttendanceRepository } from './attendance.repository';
import { RawAssignment } from './types/raw-assignment';
import { RawCourse } from './types/raw-course';
import { RawLecture } from './types/raw-lecture';

@Injectable()
export class EcampusService {
  private loginUrl: string;
  private dashboardUrl: string;
  private courseUrl: string;
  private assignmentUrl: string;

  constructor(
    private readonly axiosService: AxiosService,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly discordService: DiscordService,
  ) {
    this.loginUrl = 'https://ecampus.sejong.ac.kr/login/index.php';
    this.dashboardUrl = 'https://ecampus.sejong.ac.kr/dashboard.php';
    this.courseUrl = 'https://ecampus.sejong.ac.kr/course/view.php';
    this.assignmentUrl = 'https://ecampus.sejong.ac.kr/mod/assign/view.php';
  }

  async updateUserAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<void> {
    const courses = await this.getAllCourseAttendance(user, payload);
    await this.attendanceRepository.updateUserAttendance(user, courses);
  }

  private createFormData(username: string, password: string): FormData {
    const formData = new FormData();
    formData.append('ssoGubun', 'Login');
    formData.append('type', 'popup_login');
    formData.append('username', username);
    formData.append('password', password);
    return formData;
  }

  private async getAssignmentEndTime(
    user: UserInfo,
    id: number,
  ): Promise<{ id: number; endsAt: Date }> {
    const res = await this.axiosService.get(this.assignmentUrl + `?id=${id}`);
    try {
      const root = parse(res.data);
      let endsAt: Date = null;

      root.querySelectorAll('tr').forEach((el) => {
        if (!el.querySelector('td.cell.c0')) return;
        if (
          el.querySelector('td.cell.c0').structuredText.trim() === '종료 일시'
        ) {
          endsAt = new Date(el.querySelectorAll('td')[1].structuredText);
        }
      });

      if (!endsAt) {
        throw new BadRequestException('과제 마감일을 가져오는데 실패했습니다.');
      }
      return { id, endsAt };
    } catch (error) {
      await this.discordService.sendErrorHTMLLog(user, res.data);
      await this.discordService.sendErrorLog(error);
      throw new BadRequestException(
        '과제 정보를 가져오는데 실패했습니다. 다시 시도해주세요.',
      );
    }
  }

  private async getAllCourseAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<RawCourse[]> {
    const loginRequest = await this.axiosService.post(
      this.loginUrl,
      this.createFormData(user.studentId, payload.password),
    );

    if (String(loginRequest.data).indexOf(user.name) === -1) {
      throw new UnauthorizedException('로그인 실패');
    }

    const courseList = await this.getCourseList(user, payload, false);

    const courseAttendancePromises = courseList.map((courseId) =>
      this.getCourseAttendance(user, payload, courseId, false),
    );

    const courseAttendances = await Promise.all(courseAttendancePromises);

    return courseAttendances;
  }

  private async getCourseAttendance(
    user: UserInfo,
    payload: PasswordPayload,
    ecampusId: number,
    isLoginRequired = true,
  ): Promise<RawCourse> {
    if (isLoginRequired) {
      const loginRequest = await this.axiosService.post(
        this.loginUrl,
        this.createFormData(user.studentId, payload.password),
      );

      if (String(loginRequest.data).indexOf(user.name) === -1) {
        throw new UnauthorizedException('로그인 실패');
      }
    }

    const res = await this.axiosService.get(
      this.courseUrl + `?id=${ecampusId}`,
    );

    try {
      const lectures: RawLecture[] = [];
      let assignments: RawAssignment[] = [];

      const root = parse(res.data);

      let id: string;
      let name: string;

      try {
        const courseInfo = root.querySelector('h2.coursename').structuredText;
        const courseIdRegex = /\((\d{6}-\d{3})\)/;
        id = courseInfo.match(courseIdRegex)[1];
        name = courseInfo.replace(courseIdRegex, '').trim();
      } catch (error) {
        [name, id] = root
          .querySelector('h2.coursename')
          .structuredText.split(' ');
        id = id.slice(1, -1);
      }

      const contents = root.querySelectorAll('li.section.main.clearfix');

      // TODO: 비교과는 제외
      contents.forEach((content) => {
        const week = content.getAttribute('id')?.split('-')[1];
        if (week === '0') return;

        const rawAssignments = content.querySelectorAll(
          'li.activity.assign.modtype_assign',
        );
        const rawLectures = content.querySelectorAll(
          'li.activity.vod.modtype_vod',
        );

        if (!rawAssignments.length && !rawLectures.length) return;
        rawAssignments.forEach((assignment) => {
          if (!assignment.querySelector('span>img')) {
            return;
          }
          const [isSubmitted, name] = assignment
            .querySelector('span>img')
            .getAttribute('alt')
            .split(':');
          const assignmentId = assignment.getAttribute('id').split('-')[1];

          const assignmentData: RawAssignment = {
            id: Number(assignmentId),
            name,
            week: parseInt(week),
            isDone: isSubmitted.trim() === '완료함' ? true : false,
          };
          assignments.push(assignmentData);
        });

        rawLectures.forEach((lecture) => {
          if (
            !lecture.querySelector('span.text-ubstrap') ||
            !lecture.querySelector('span>img')
          ) {
            return;
          }
          const [isSubmitted, name] = lecture
            .querySelector('span>img')
            .getAttribute('alt')
            .split(':');
          const [startsAt, endsAt] = lecture
            .querySelector('span.text-ubstrap')
            ?.structuredText.split('~');

          const lectureId = lecture.getAttribute('id').split('-')[1];

          const lectureData: RawLecture = {
            id: Number(lectureId),
            name,
            isDone: isSubmitted.trim() === '완료함' ? true : false,
            week: parseInt(week),
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt),
          };
          lectures.push(lectureData);
        });
      });

      const assignmentEndTimes = await Promise.all(
        assignments.map((assignment) =>
          this.getAssignmentEndTime(user, assignment.id),
        ),
      );

      assignments = assignments.map((assignment) => {
        const endTime = assignmentEndTimes.find(
          (assignmentEndTime) => assignmentEndTime.id === assignment.id,
        );
        return {
          ...assignment,
          endsAt: endTime.endsAt,
        };
      });

      return {
        id: id.trim(),
        name: name.trim(),
        ecampusId,
        lectures: _.uniqBy(lectures, 'id'),
        assignments: _.uniqBy(assignments, 'id'),
      };
    } catch (error) {
      await this.discordService.sendErrorHTMLLog(user, res.data);
      await this.discordService.sendErrorLog(error);
      throw new BadRequestException(
        '강의 정보를 가져오는데 실패했습니다. 다시 시도해주세요.',
      );
    }
  }

  private async getCourseList(
    user: UserInfo,
    payload: PasswordPayload,
    isLoginRequired = true,
  ): Promise<number[]> {
    if (isLoginRequired) {
      const loginRequest = await this.axiosService.post(
        this.loginUrl,
        this.createFormData(user.studentId, payload.password),
      );

      if (String(loginRequest.data).indexOf(user.name) === -1) {
        throw new UnauthorizedException('로그인 실패');
      }
    }

    const res = await this.axiosService.get(this.dashboardUrl);

    try {
      const root = parse(res.data);
      const contents = root.querySelectorAll('li.course-label-r');

      const courseList = contents.map((content) => {
        const courseId = content
          .querySelector('a')
          .getAttribute('href')
          .split('=')[1];

        return Number(courseId);
      });

      return courseList;
    } catch (error) {
      await this.discordService.sendErrorHTMLLog(user, res.data);
      await this.discordService.sendErrorLog(error);
      throw new BadRequestException(
        '강의 목록을 가져오는데 실패했습니다. 다시 시도해주세요.',
      );
    }
  }
}
