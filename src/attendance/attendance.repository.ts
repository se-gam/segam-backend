import { Injectable } from '@nestjs/common';
import { UserInfo } from 'src/auth/types/user-info.type';
import { PrismaService } from 'src/common/services/prisma.service';
import { CourseAttendance } from './types/courseAttendance';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async updateUserAttendance(
    user: UserInfo,
    courses: CourseAttendance[],
  ): Promise<void> {
    console.log(user.studentId);
    courses.forEach(async (course: CourseAttendance) => {
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
    });
  }
}
