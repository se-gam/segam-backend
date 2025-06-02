import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/common/services/prisma.service";
import { CreateUpdateAssignmentPayload } from "./payload/create-update-assignment.payload";

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createAssignment(userId: string, payload: CreateUpdateAssignmentPayload): Promise<void> {
    const course = await this.prisma.course.findFirst({
      where: { id: payload.courseId },
    });
    if (!course) {
      throw new NotFoundException(`해당 ID의 강의가 존재하지 않습니다.`);
    }
    const newAssignment = await this.prisma.assignment.create({
      data: {
        name: payload.name,
        endsAt: payload.endsAt,
        course: {
          connect: {
            id: payload.courseId
          },
        },
      }
    })

    await this.prisma.userAssignment.create({
      data: {
        isDone: false,
        studentId: userId,
        assignmentId: newAssignment.id,
      }
    })
  }

  async updateAssignment(userId: string, id: number, payload: CreateUpdateAssignmentPayload): Promise<void> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`해당 ID의 과제가 존재하지 않습니다.`);
    }
    const userAssignment = await this.prisma.userAssignment.findFirst({
      where: {
        studentId: userId,
        assignmentId: id,
      },
    });
    if (userAssignment.studentId !== userId) {
      throw new BadRequestException(`해당 과제를 삭제할 권한이 없습니다.`);
    }


    await this.prisma.assignment.update({
      where: { id },
      data: {
        name: payload.name,
        endsAt: payload.endsAt,
      },
    });
  }

  async deleteAssignment(userId: string, id: number): Promise<void> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(`해당 ID의 과제가 존재하지 않습니다.`);
    }
    const userAssignment = await this.prisma.userAssignment.findFirst({
      where: {
        studentId: userId,
        assignmentId: id,
      },
    });
    if (!userAssignment || userAssignment.studentId !== userId) {
      throw new BadRequestException(`해당 과제를 삭제할 권한이 없습니다.`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userAssignment.delete({
        where: { id: userAssignment.id },
      });
      await tx.assignment.delete({
        where: { id },
      });
    });
  }
}