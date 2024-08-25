import { Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { AssignmentData } from './types/assignment-data';
import { CourseData } from './types/course-data';
import { LectureData } from './types/lecture-data';
import { RawCourse } from './types/raw-course';

import * as _ from 'lodash';
import { getCurrentSemester } from './utils/getCurrentSemester';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getCourseAttendanceList(user: UserInfo): Promise<CourseData[]> {
    console.log(getCurrentSemester());
    return await this.prismaService.course.findMany({
      where: {
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        semester: getCurrentSemester(),
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        ecampusId: true,
        name: true,
        lectures: {
          where: {
            deletedAt: null,
            users: {
              some: {
                studentId: user.studentId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            week: true,
            startsAt: true,
            endsAt: true,
            users: {
              where: {
                studentId: user.studentId,
              },
              select: {
                isDone: true,
              },
            },
          },
          orderBy: {
            endsAt: 'asc',
          },
        },
        assignments: {
          where: {
            deletedAt: null,
            users: {
              some: {
                studentId: user.studentId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            week: true,
            endsAt: true,
            users: {
              select: {
                isDone: true,
              },
            },
          },
          orderBy: {
            endsAt: 'asc',
          },
        },
      },
    });
  }

  async getCourseAttendanceByEcampusId(
    user: UserInfo,
    ecampusId: number,
  ): Promise<CourseData> {
    return await this.prismaService.course.findFirst({
      where: {
        ecampusId,
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        deletedAt: null,
      },
      select: {
        id: true,
        courseId: true,
        ecampusId: true,
        name: true,
        lectures: {
          where: {
            deletedAt: null,
            users: {
              some: {
                studentId: user.studentId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            week: true,
            startsAt: true,
            endsAt: true,
            users: {
              where: {
                studentId: user.studentId,
              },
              select: {
                isDone: true,
              },
            },
          },
          orderBy: {
            endsAt: 'asc',
          },
        },
        assignments: {
          where: {
            deletedAt: null,
            users: {
              some: {
                studentId: user.studentId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            week: true,
            endsAt: true,
            users: {
              select: {
                isDone: true,
              },
            },
          },
          orderBy: {
            endsAt: 'asc',
          },
        },
      },
    });
  }

  async getLectureAttendanceList(user: UserInfo): Promise<LectureData[]> {
    return await this.prismaService.lecture.findMany({
      where: {
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        course: {
          semester: getCurrentSemester(),
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        week: true,
        startsAt: true,
        endsAt: true,
        users: {
          where: {
            studentId: user.studentId,
          },
          select: {
            isDone: true,
          },
        },
      },
      orderBy: {
        endsAt: 'asc',
      },
    });
  }

  async getAssignmentAttendanceList(user: UserInfo): Promise<AssignmentData[]> {
    return await this.prismaService.assignment.findMany({
      where: {
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        course: {
          semester: getCurrentSemester(),
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        week: true,
        endsAt: true,
        users: {
          where: {
            studentId: user.studentId,
          },
          select: {
            isDone: true,
          },
        },
      },
      orderBy: {
        endsAt: 'asc',
      },
    });
  }

  async updateUserAttendance(
    user: UserInfo,
    courses: RawCourse[],
  ): Promise<void> {
    const prevCourses = await this.prismaService.course.findMany({
      where: {
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        semester: getCurrentSemester(),
        deletedAt: null,
      },
      select: {
        courseId: true,
      },
    });

    const prevIds = prevCourses.map((course) => course.courseId);
    const newIds = courses.map((course) => course.id); // RawCourse의 id는 학수번호

    const deletedIds = _.difference(prevIds, newIds);
    const createdIds = _.difference(newIds, prevIds);

    const createdCourses = courses.filter((course) =>
      createdIds.includes(course.id),
    );

    // 수강철회 등 들었던 강의들이 사라졌을 경우
    await this.prismaService.$transaction(
      async (tx) => {
        await tx.userCourse.deleteMany({
          where: {
            courseId: {
              in: deletedIds,
            },
            studentId: user.studentId,
          },
        });

        await tx.userLecture.deleteMany({
          where: {
            lecture: {
              courseId: {
                in: deletedIds,
              },
            },
            studentId: user.studentId,
          },
        });

        await tx.userAssignment.deleteMany({
          where: {
            assignment: {
              courseId: {
                in: deletedIds,
              },
            },
            studentId: user.studentId,
          },
        });
      },
      {
        timeout: 20000,
      },
    );

    // 강의가 이미 DB에 있던, 없던 추가
    await this.prismaService.$transaction(
      async (tx) => {
        await tx.course.createMany({
          data: createdCourses.map((course) => {
            return {
              courseId: course.id,
              ecampusId: course.ecampusId,
              name: course.name,
              semester: getCurrentSemester(),
            };
          }),
          skipDuplicates: true,
        });

        await tx.userCourse.createMany({
          data: createdCourses.map((course) => {
            return {
              studentId: user.studentId,
              courseId: course.id,
            };
          }),
          skipDuplicates: true,
        });
      },
      {
        timeout: 20000,
      },
    );

    // 강의별로 강의, 과제 추가
    for (const course of courses) {
      await this.prismaService.$transaction(
        async (tx) => {
          const prevLectures = await tx.lecture.findMany({
            where: {
              courseId: course.id,
              users: {
                some: {
                  studentId: user.studentId,
                },
              },
              deletedAt: null,
            },
            select: {
              id: true,
            },
          });
          const prevLectureIds = prevLectures.map((lecture) => lecture.id);
          const newLectureIds = course.lectures.map((lecture) =>
            parseInt(lecture.id),
          );

          const existingLectureIds = _.intersection(
            prevLectureIds,
            newLectureIds,
          );
          const deletedLectureIds = _.difference(
            prevLectureIds,
            existingLectureIds,
          );
          const createdLectureIds = _.difference(
            newLectureIds,
            existingLectureIds,
          );

          const createdLectures = course.lectures.filter((lecture) =>
            createdLectureIds.includes(lecture.id),
          );

          const existingLectures = course.lectures.filter((lecture) =>
            existingLectureIds.includes(lecture.id),
          );

          // 사라진 강의들 삭제
          await tx.userLecture.deleteMany({
            where: {
              lectureId: {
                in: deletedLectureIds,
              },
              studentId: user.studentId,
            },
          });

          // 이미 있는 강의들 업데이트
          for (const lecture of existingLectures) {
            await tx.lecture.update({
              where: {
                id: lecture.id,
              },
              data: {
                name: lecture.name,
                week: lecture.week,
                startsAt: lecture.startsAt,
                endsAt: lecture.endsAt,
              },
            });

            await tx.userLecture.update({
              where: {
                studentId_lectureId: {
                  studentId: user.studentId,
                  lectureId: lecture.id,
                },
              },
              data: {
                isDone: lecture.isDone,
              },
            });
          }

          // 새로운 강의들 추가
          for (const lecture of createdLectures) {
            await tx.lecture.upsert({
              where: {
                id: lecture.id,
              },
              update: {
                name: lecture.name,
                week: lecture.week,
                startsAt: lecture.startsAt,
                endsAt: lecture.endsAt,
              },
              create: {
                id: lecture.id,
                name: lecture.name,
                week: lecture.week,
                startsAt: lecture.startsAt,
                endsAt: lecture.endsAt,
                course: {
                  connect: {
                    id: course.id,
                  },
                },
              },
            });
          }

          await tx.userLecture.createMany({
            data: createdLectures.map((lecture) => {
              return {
                studentId: user.studentId,
                lectureId: lecture.id,
                isDone: lecture.isDone,
              };
            }),
          });

          const prevAssignments = await tx.assignment.findMany({
            where: {
              courseId: course.id,
              users: {
                some: {
                  studentId: user.studentId,
                },
              },
              deletedAt: null,
            },
            select: {
              id: true,
            },
          });

          const prevAssignmentIds = prevAssignments.map(
            (assignment) => assignment.id,
          );
          const newAssignmentIds = course.assignments.map((assignment) =>
            parseInt(assignment.id),
          );

          const existingAssignmentIds = _.intersection(
            prevAssignmentIds,
            newAssignmentIds,
          );
          const deletedAssignmentIds = _.difference(
            prevAssignmentIds,
            existingAssignmentIds,
          );
          const createdAssignmentIds = _.difference(
            newAssignmentIds,
            existingAssignmentIds,
          );

          const createdAssignments = course.assignments.filter((assignment) =>
            createdAssignmentIds.includes(assignment.id),
          );

          const existingAssignments = course.assignments.filter((assignment) =>
            existingAssignmentIds.includes(assignment.id),
          );

          // 사라진 과제들 삭제
          await tx.userAssignment.deleteMany({
            where: {
              assignmentId: {
                in: deletedAssignmentIds,
              },
              studentId: user.studentId,
            },
          });

          // 이미 있는 과제들 업데이트
          for (const assignment of existingAssignments) {
            await tx.assignment.update({
              where: {
                id: assignment.id,
              },
              data: {
                name: assignment.name,
                week: assignment.week,
                endsAt: assignment.endsAt,
              },
            });

            await tx.userAssignment.update({
              where: {
                studentId_assignmentId: {
                  studentId: user.studentId,
                  assignmentId: assignment.id,
                },
              },
              data: {
                isDone: assignment.isDone,
              },
            });
          }

          // 새로운 과제들 추가
          for (const assignment of createdAssignments) {
            await tx.assignment.upsert({
              where: {
                id: assignment.id,
              },
              update: {
                name: assignment.name,
                week: assignment.week,
                endsAt: assignment.endsAt,
              },
              create: {
                id: assignment.id,
                name: assignment.name,
                week: assignment.week,
                endsAt: assignment.endsAt,
                course: {
                  connect: {
                    id: course.id,
                  },
                },
              },
            });
          }
          await tx.userAssignment.createMany({
            data: createdAssignments.map((assignment) => {
              return {
                studentId: user.studentId,
                assignmentId: assignment.id,
                isDone: assignment.isDone,
              };
            }),
          });
        },
        {
          timeout: 20000,
        },
      );
    }
  }
}
