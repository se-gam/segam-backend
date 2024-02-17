import { Injectable, UnauthorizedException } from '@nestjs/common';
import { parse } from 'node-html-parser';
import { PasswordPayload } from 'src/auth/payload/password.payload';
import { UserInfo } from 'src/auth/types/user-info.type';
import { AxiosService } from 'src/common/services/axios.service';
import { CourseAttendance } from './types/courseAttendance';
import { RawAssignment } from './types/rawAssignment';
import { RawLecture } from './types/rawLecture';

@Injectable()
export class EcampusService {
  private loginUrl: string;
  private dashboardUrl: string;
  private courseUrl: string;
  private assignmentUrl: string;

  constructor(private readonly axiosService: AxiosService) {
    this.loginUrl = 'https://ecampus.sejong.ac.kr/login/index.php';
    this.dashboardUrl = 'https://ecampus.sejong.ac.kr/dashboard.php';
    this.courseUrl = 'https://ecampus.sejong.ac.kr/course/view.php';
    this.assignmentUrl = 'https://ecampus.sejong.ac.kr/mod/assign/view.php';
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
    id: number,
  ): Promise<{ id: number; endsAt: Date }> {
    const res = await this.axiosService.get(this.assignmentUrl + `?id=${id}`);
    const root = parse(res.data);
    let endsAt: Date;

    root.querySelectorAll('tr').forEach((el) => {
      if (
        el.querySelector('td.cell.c0').structuredText.trim() === '종료 일시'
      ) {
        endsAt = new Date(el.querySelectorAll('td')[1].structuredText);
      }
    });

    return { id, endsAt };
  }

  async getAllCourseAttendance(
    user: UserInfo,
    payload: PasswordPayload,
  ): Promise<CourseAttendance[]> {
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

  async getCourseAttendance(
    user: UserInfo,
    payload: PasswordPayload,
    ecampusId: number,
    isLoginRequired = true,
  ): Promise<CourseAttendance> {
    if (isLoginRequired) {
      const loginRequest = await this.axiosService.post(
        this.loginUrl,
        this.createFormData(user.studentId, payload.password),
      );

      if (String(loginRequest.data).indexOf(user.name) === -1) {
        throw new UnauthorizedException('로그인 실패');
      }
    }

    const lectures: RawLecture[] = [];
    let assignments: RawAssignment[] = [];

    const res = await this.axiosService.get(
      this.courseUrl + `?id=${ecampusId}`,
    );
    const root = parse(res.data);
    const [name, id] = root
      .querySelector('h2.coursename')
      .structuredText.slice(0, -1)
      .split('(');

    const contents = root.querySelectorAll('li.section.main.clearfix');

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
        const [isSubmitted, name] = assignment
          .querySelector('span>img')
          .getAttribute('alt')
          .split(':');
        const assignmentId = assignment
          .querySelector('a')
          .getAttribute('href')
          .split('=')[1];

        const assignmentData: RawAssignment = {
          ecampusId: Number(assignmentId),
          name,
          week,
          isDone: isSubmitted.trim() === '완료함' ? true : false,
        };
        assignments.push(assignmentData);
      });

      rawLectures.forEach((lecture) => {
        const [isSubmitted, name] = lecture
          .querySelector('span>img')
          .getAttribute('alt')
          .split(':');
        const [startsAt, endsAt] = lecture
          .querySelector('span.text-ubstrap')
          ?.structuredText.split('~');

        const lectureId = lecture
          .querySelector('a')
          .getAttribute('href')
          .split('=')[1];

        const lectureData: RawLecture = {
          ecampusId: Number(lectureId),
          name,
          isDone: isSubmitted.trim() === '완료함' ? true : false,
          week,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
        };
        lectures.push(lectureData);
      });
    });

    const assignmentEndTimes = await Promise.all(
      assignments.map((assignment) =>
        this.getAssignmentEndTime(assignment.ecampusId),
      ),
    );

    // TODO: Lodash로 바꾸기
    assignments = assignments.map((assignment) => {
      const endTime = assignmentEndTimes.find(
        (assignmentEndTime) => assignmentEndTime.id === assignment.ecampusId,
      );
      if (!endTime.endsAt) return;
      return {
        ...assignment,
        endsAt: endTime.endsAt,
      };
    });

    return {
      id,
      name,
      ecampusId,
      lectures,
      assignments,
    };
  }

  async getCourseList(
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
    const root = parse(res.data);

    const contents = root.querySelectorAll('li.course-label-ir');

    const courseList = contents.map((content) => {
      const courseId = content
        .querySelector('a')
        .getAttribute('href')
        .split('=')[1];
      return Number(courseId);
    });

    return courseList;
  }
}
