import { ApiProperty } from '@nestjs/swagger';
import * as _ from 'lodash';
import { AssignmentData } from '../types/assignment-data';
import { CourseData } from '../types/course-data';
import { LectureData } from '../types/lecture-data';
import { AssignmentAttendanceDto } from './assignment-attendance.dto';
import { LectureAttendanceDto } from './lecture-attendance.dto';

export class CourseAttendanceDto {
  @ApiProperty({
    description: '학수번호',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '강좌 Ecampus id',
    type: Number,
  })
  ecampusId!: number;

  @ApiProperty({
    description: '과목명',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '강의 결석 횟수',
    type: Number,
  })
  lectureAbsences!: number;

  @ApiProperty({
    description: '과제 결석 횟수',
    type: Number,
  })
  assignmentAbsences!: number;

  @ApiProperty({
    description:
      '강의가 올라오는 요일 (Date.getDay() 값). 주기적으로 올라오는 강의가 아닌 경우 null',
    type: Number,
  })
  updateDay!: number | null;

  @ApiProperty({
    description: '과제 제출 여부. 남은 과제가 없을 경우 null',
    type: Date,
  })
  imminentDueDate!: Date | null;

  @ApiProperty({
    description: '다음 강의 오픈 날짜. 등록된 강의가 없을 경우 null',
    type: Date,
  })
  nextLectureDate!: Date | null;

  @ApiProperty({
    description: '현재 수강할 수 있는 남은 강의 수',
    type: Number,
  })
  lecturesLeft!: number;

  @ApiProperty({
    description: '현재 제출할 수 있는 남은 과제 수',
    type: Number,
  })
  assignmentsLeft!: number;

  @ApiProperty({
    description: '강의 목록',
    type: LectureAttendanceDto,
  })
  lectures!: LectureAttendanceDto[];

  @ApiProperty({
    description: '과제 목록',
    type: AssignmentAttendanceDto,
  })
  assignments!: AssignmentAttendanceDto[];

  static from(course: CourseData): CourseAttendanceDto {
    const today = new Date();

    // 아직 수강하지 않은 강의 중 종료된 강의 수
    const lectureAbsences = _.chain(course.lectures)
      .filter((lecture) => !lecture.users[0].isDone && lecture.endsAt <= today)
      .value().length;

    // 아직 제출하지 않은 과제 중 종료된 과제 수
    const assignmentAbsences = _.chain(course.assignments)
      .filter(
        (assignment) =>
          !assignment.users[0].isDone && assignment.endsAt <= today,
      )
      .value().length;

    // 모든 강의들의 startsAt.getDay() 값들을 뽑아서 중복 제거한뒤 1개면 정기적으로 올라온다고 판단
    const updateDay = _.chain(course.lectures)
      .map((lecture) => lecture.startsAt.getDay())
      .uniq()
      .value();

    // 할 수있는데 아직 제출하지 않은 과제나 수강하지 않은 강의 중 마감 시간이 가장 가까운 작업
    const imminentDueDate = _.chain([...course.assignments, ...course.lectures])
      .filter(
        (job: AssignmentData | LectureData) =>
          !job.users[0].isDone && job.endsAt >= today,
      )
      .filter((job: AssignmentData | LectureData) => {
        if ('startsAt' in job) {
          return job.startsAt < today && !job.users[0].isDone;
        } else {
          return true;
        }
      })
      .map((job: AssignmentData | LectureData) => job.endsAt)
      .min()
      .value();

    // 오늘 이후로 시작하는 강의 중 가장 빨리 시작하는 강의
    const nextLectureDate = _.chain(course.lectures)
      .filter((lecture) => lecture.startsAt > today)
      .map((lecture) => lecture.startsAt)
      .min()
      .value();

    // 아직 수강하지 않은 강의 중 수강할 수 있는 강의 수
    const lecturesLeft = _.chain(course.lectures)
      .filter(
        (lecture) =>
          lecture.startsAt < today &&
          lecture.endsAt >= today &&
          !lecture.users[0].isDone,
      )
      .value().length;

    // 아직 제출하지 않은 과제 중 제출할 수 있는 과제 수
    const assignmentsLeft = _.chain(course.assignments)
      .filter(
        (assignment) =>
          assignment.endsAt >= today && !assignment.users[0].isDone,
      )
      .value().length;

    return {
      id: course.id,
      ecampusId: course.ecampusId,
      name: course.name,
      lectureAbsences,
      assignmentAbsences,
      updateDay: updateDay.length === 1 ? updateDay[0] : null,
      imminentDueDate,
      nextLectureDate,
      lecturesLeft,
      assignmentsLeft,
      lectures: course.lectures.map((lecture) =>
        LectureAttendanceDto.from(lecture),
      ),
      assignments: course.assignments.map((assignment) =>
        AssignmentAttendanceDto.from(assignment),
      ),
    };
  }
}
