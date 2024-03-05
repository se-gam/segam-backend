import { Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { AssignmentData } from './types/assignment-data';
import { CourseData } from './types/course-data';
import { LectureData } from './types/lecture-data';
import { RawCourse } from './types/raw-course';

import * as _ from 'lodash';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getCourseAttendanceList(user: UserInfo): Promise<CourseData[]> {
    return await this.prismaService.course.findMany({
      where: {
        users: {
          some: {
            studentId: user.studentId,
          },
        },
        deletedAt: null,
      },
      select: {
        id: true,
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

  // async updateUserAttendance(
  //   user: UserInfo,
  //   courses: RawCourse[],
  // ): Promise<void> {
  //   await this.prismaService.$transaction([
  //     this.prismaService.course.createMany({
  //       data: courses.map((course) => {
  //         return {
  //           id: course.id,
  //           ecampusId: course.ecampusId,
  //           name: course.name,
  //         };
  //       }),
  //       skipDuplicates: true,
  //     }),
  //     this.prismaService.userCourse.createMany({
  //       data: courses.map((course) => {
  //         return {
  //           studentId: user.studentId,
  //           courseId: course.id,
  //         };
  //       }),
  //       skipDuplicates: true,
  //     }),
  //   ]);

  //   for (const course of courses) {
  //     await this.prismaService.$transaction(async (tx) => {
  //       for (const rawLecture of course.lectures) {
  //         const lecture = await tx.lecture.upsert({
  //           where: {
  //             id: rawLecture.id,
  //           },
  //           update: {
  //             name: rawLecture.name,
  //             endsAt: rawLecture.endsAt,
  //           },
  //           create: {
  //             id: rawLecture.id,
  //             name: rawLecture.name,
  //             week: rawLecture.week,
  //             startsAt: rawLecture.startsAt,
  //             endsAt: rawLecture.endsAt,
  //             course: {
  //               connect: {
  //                 id: course.id,
  //               },
  //             },
  //           },
  //           select: {
  //             id: true,
  //           },
  //         });
  //         await tx.userLecture.upsert({
  //           where: {
  //             studentId_lectureId: {
  //               studentId: user.studentId,
  //               lectureId: lecture.id,
  //             },
  //           },
  //           update: {
  //             isDone: rawLecture.isDone,
  //           },
  //           create: {
  //             isDone: rawLecture.isDone,
  //             user: {
  //               connect: {
  //                 studentId: user.studentId,
  //               },
  //             },
  //             lecture: {
  //               connect: {
  //                 id: lecture.id,
  //               },
  //             },
  //           },
  //         });
  //       }

  //       for (const rawAssignment of course.assignments) {
  //         const assignment = await tx.assignment.upsert({
  //           where: {
  //             id: rawAssignment.id,
  //           },
  //           update: {
  //             name: rawAssignment.name,
  //             endsAt: rawAssignment.endsAt,
  //           },
  //           create: {
  //             id: rawAssignment.id,
  //             name: rawAssignment.name,
  //             week: rawAssignment.week,
  //             endsAt: rawAssignment.endsAt,
  //             course: {
  //               connectOrCreate: {
  //                 where: {
  //                   ecampusId: course.ecampusId,
  //                   deletedAt: null,
  //                 },
  //                 create: {
  //                   id: course.id,
  //                   ecampusId: course.ecampusId,
  //                   name: course.name,
  //                 },
  //               },
  //             },
  //           },
  //           select: {
  //             id: true,
  //           },
  //         });

  //         await tx.userAssignment.upsert({
  //           where: {
  //             studentId_assignmentId: {
  //               studentId: user.studentId,
  //               assignmentId: assignment.id,
  //             },
  //           },
  //           update: {
  //             isDone: rawAssignment.isDone,
  //           },
  //           create: {
  //             isDone: rawAssignment.isDone,
  //             user: {
  //               connect: {
  //                 studentId: user.studentId,
  //               },
  //             },
  //             assignment: {
  //               connect: {
  //                 id: assignment.id,
  //               },
  //             },
  //           },
  //         });
  //       }
  //     });
  //   }
  // }

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
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    const prevIds = prevCourses.map((course) => course.id);
    const newIds = courses.map((course) => course.id);

    const deletedIds = _.difference(prevIds, newIds);
    const createdIds = _.difference(newIds, prevIds);

    const createdCourses = courses.filter((course) =>
      createdIds.includes(course.id),
    );

    // 수강철회 등 들었던 강의들이 사라졌을 경우
    this.prismaService.$transaction([
      this.prismaService.userCourse.deleteMany({
        where: {
          courseId: {
            in: deletedIds,
          },
          studentId: user.studentId,
        },
      }),

      this.prismaService.userLecture.deleteMany({
        where: {
          lecture: {
            courseId: {
              in: deletedIds,
            },
          },
          studentId: user.studentId,
        },
      }),

      this.prismaService.userAssignment.deleteMany({
        where: {
          assignment: {
            courseId: {
              in: deletedIds,
            },
          },
          studentId: user.studentId,
        },
      }),
    ]);

    // 강의가 이미 DB에 있던, 없던 추가
    this.prismaService.$transaction([
      this.prismaService.course.createMany({
        data: createdCourses.map((course) => {
          return {
            id: course.id,
            ecampusId: course.ecampusId,
            name: course.name,
          };
        }),
        skipDuplicates: true,
      }),

      this.prismaService.userCourse.createMany({
        data: createdCourses.map((course) => {
          return {
            studentId: user.studentId,
            courseId: course.id,
          };
        }),
        skipDuplicates: true,
      }),
    ]);

    // 강의별로 강의, 과제 추가
    for (const course of createdCourses) {
      await this.prismaService.$transaction(async (tx) => {
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
        const newLectureIds = course.lectures.map((lecture) => lecture.id);

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
        await tx.lecture.createMany({
          data: createdLectures.map((lecture) => {
            return {
              id: lecture.id,
              name: lecture.name,
              week: lecture.week,
              startsAt: lecture.startsAt,
              endsAt: lecture.endsAt,
              courseId: course.id,
            };
          }),
        });
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
        const newAssignmentIds = course.assignments.map(
          (assignment) => assignment.id,
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
        await tx.assignment.createMany({
          data: createdAssignments.map((assignment) => {
            return {
              id: assignment.id,
              name: assignment.name,
              week: assignment.week,
              endsAt: assignment.endsAt,
              courseId: course.id,
            };
          }),
        });
        await tx.userAssignment.createMany({
          data: createdAssignments.map((assignment) => {
            return {
              studentId: user.studentId,
              assignmentId: assignment.id,
              isDone: assignment.isDone,
            };
          }),
        });
      });
    }
  }
}
