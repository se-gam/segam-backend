import { Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { AssignmentData } from './types/assignment-data';
import { CourseData } from './types/course-data';
import { LectureData } from './types/lecture-data';
import { RawCourse } from './types/raw-course';

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

  async updateUserAttendance(
    user: UserInfo,
    courses: RawCourse[],
  ): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.course.createMany({
        data: courses.map((course) => {
          return {
            id: course.id,
            ecampusId: course.ecampusId,
            name: course.name,
          };
        }),
        skipDuplicates: true,
      }),
      this.prismaService.userCourse.createMany({
        data: courses.map((course) => {
          return {
            studentId: user.studentId,
            courseId: course.id,
          };
        }),
        skipDuplicates: true,
      }),
    ]);

    for (const course of courses) {
      await this.prismaService.$transaction(async (tx) => {
        for (const rawLecture of course.lectures) {
          const lecture = await tx.lecture.upsert({
            where: {
              id: rawLecture.id,
            },
            update: {
              name: rawLecture.name,
              endsAt: rawLecture.endsAt,
            },
            create: {
              id: rawLecture.id,
              name: rawLecture.name,
              week: rawLecture.week,
              startsAt: rawLecture.startsAt,
              endsAt: rawLecture.endsAt,
              course: {
                connect: {
                  id: course.id,
                },
              },
            },
            select: {
              id: true,
            },
          });
          await tx.userLecture.upsert({
            where: {
              studentId_lectureId: {
                studentId: user.studentId,
                lectureId: lecture.id,
              },
            },
            update: {
              isDone: rawLecture.isDone,
            },
            create: {
              isDone: rawLecture.isDone,
              user: {
                connect: {
                  studentId: user.studentId,
                },
              },
              lecture: {
                connect: {
                  id: lecture.id,
                },
              },
            },
          });
        }

        for (const rawAssignment of course.assignments) {
          const assignment = await tx.assignment.upsert({
            where: {
              id: rawAssignment.id,
            },
            update: {
              name: rawAssignment.name,
              endsAt: rawAssignment.endsAt,
            },
            create: {
              id: rawAssignment.id,
              name: rawAssignment.name,
              week: rawAssignment.week,
              endsAt: rawAssignment.endsAt,
              course: {
                connectOrCreate: {
                  where: {
                    ecampusId: course.ecampusId,
                    deletedAt: null,
                  },
                  create: {
                    id: course.id,
                    ecampusId: course.ecampusId,
                    name: course.name,
                  },
                },
              },
            },
            select: {
              id: true,
            },
          });

          await tx.userAssignment.upsert({
            where: {
              studentId_assignmentId: {
                studentId: user.studentId,
                assignmentId: assignment.id,
              },
            },
            update: {
              isDone: rawAssignment.isDone,
            },
            create: {
              isDone: rawAssignment.isDone,
              user: {
                connect: {
                  studentId: user.studentId,
                },
              },
              assignment: {
                connect: {
                  id: assignment.id,
                },
              },
            },
          });
        }
      });
    }
  }
}
