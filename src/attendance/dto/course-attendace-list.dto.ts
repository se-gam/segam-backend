import { ApiProperty } from '@nestjs/swagger';
import * as _ from 'lodash';
import { isSameTime } from 'src/common/utils/isSameTime';
import { CourseData } from '../types/course-data';
import { CourseAttendanceDto } from './course-attendance.dto';

export class CourseAttendanceListDto {
  @ApiProperty({
    description: '모든 강좌의 출석 정보',
    type: [CourseAttendanceDto],
  })
  courses!: CourseAttendanceDto[];

  @ApiProperty({
    description: '수강 가능한 강의의 수 + 제출해야하는 과제의 수',
    type: Number,
  })
  totalJobs!: number;

  @ApiProperty({
    description:
      '모든 강좌중 가장 임박한 강의나 과제의 시각. 모두 출석했으면 null',
    type: Date,
  })
  imminentDueDate!: Date | null;

  @ApiProperty({
    description: '임박한 강의나 과제가 있는 강좌명. 없다면 null',
    type: String,
  })
  imminentCourseName!: string | null;

  @ApiProperty({
    description: '임박한 강의나 과제가 있는 강좌 id. 없다면 null',
    type: String,
  })
  imminentCourseId!: string | null;

  @ApiProperty({
    description: '다음 강의 오픈 날짜. 등록된 강의가 없다면 null',
    type: Date,
  })
  nextLectureDate!: Date | null;

  @ApiProperty({
    description: '다음 강의 오픈 날짜가 있는 강좌명. 없다면 null',
    type: String,
  })
  nextLectureCourseName!: string | null;

  @ApiProperty({
    description: '다음 강의 오픈 날짜가 있는 강좌 id. 없다면 null',
    type: String,
  })
  nextLectureCourseId!: string | null;

  @ApiProperty({
    description: 'imminentDueDate까지 수강해야하는 강의 수',
    type: Number,
  })
  imminentLecturesLeft!: number;

  @ApiProperty({
    description: 'imminentDueDate까지 제출해야하는 과제 수',
    type: Number,
  })
  imminentAssignmentsLeft!: number;

  static from(courses: CourseData[]): CourseAttendanceListDto {
    const resultCourses = courses.map((course) =>
      CourseAttendanceDto.from(course),
    );

    // 할 수 있는 총 할 일 수
    const totalJobs = _.sumBy(
      resultCourses.map(
        (course) => course.assignmentsLeft + course.lecturesLeft,
      ),
    );

    // 모든 할 일 중 가장 임박한 일
    const imminentDueDate = _.minBy(
      resultCourses.map((course) => course.imminentDueDate),
    );

    // imminentDueDate까지 가장 임박한 강좌
    const imminentCourse = _.find(resultCourses, (course) =>
      isSameTime(course.imminentDueDate, imminentDueDate),
    );

    // 가장 가까운 다음 강의 오픈일
    const nextLectureDate = _.minBy(
      resultCourses.map((course) => course.nextLectureDate),
    );

    // 다음 강의 오픈일이 있는 강좌
    const nextLectureCourse = _.find(resultCourses, (course) =>
      isSameTime(course.nextLectureDate, nextLectureDate),
    );

    // imminentDueDate까지 수강해야하는 강의 수
    const imminentLecturesLeft = _.chain(resultCourses)
      .flatMap((course) => course.lectures)
      .filter(
        (lecture) =>
          isSameTime(lecture.endsAt, imminentDueDate) && !lecture.isDone,
      )
      .value().length;

    // imminentDueDate까지 제출해야하는 과제 수
    const imminentAssignmentsLeft = _.chain(resultCourses)
      .flatMap((course) => course.assignments)
      .filter(
        (assignment) =>
          isSameTime(assignment.endsAt, imminentDueDate) && !assignment.isDone,
      )
      .value().length;

    return {
      courses: resultCourses,
      totalJobs,
      imminentDueDate: imminentDueDate || null,
      imminentCourseName: imminentDueDate ? imminentCourse.name : null,
      imminentCourseId: imminentDueDate ? imminentCourse.id : null,
      nextLectureDate: nextLectureDate || null,
      nextLectureCourseName: nextLectureDate ? nextLectureCourse.name : null,
      nextLectureCourseId: nextLectureDate ? nextLectureCourse.id : null,
      imminentLecturesLeft,
      imminentAssignmentsLeft,
    };
  }
}
