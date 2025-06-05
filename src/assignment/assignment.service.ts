import { Injectable } from "@nestjs/common";
import { CreateUpdateAssignmentPayload } from "./payload/create-update-assignment.payload";
import { UserInfo } from "src/auth/types/user-info.type";
import { AssignmentRepository } from "./assignment.repository";
import { Assignment } from "@prisma/client";

@Injectable()
export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
  ) {}
  
  async createAssignment(user: UserInfo, payload: CreateUpdateAssignmentPayload): Promise<void> {
    return await this.assignmentRepository.createAssignment(user.studentId, payload);
  }

  async findAssignmentById(user: UserInfo, id: string): Promise<Assignment> {
    return await this.assignmentRepository.findAssignmentById(user.studentId, id);
  }

  async updateAssignment(user: UserInfo, id: string, payload: CreateUpdateAssignmentPayload): Promise<void> {
    return await this.assignmentRepository.updateAssignment(user.studentId, id, payload);
  }

  async deleteAssignment(user: UserInfo, id: string): Promise<void> {
    return await this.assignmentRepository.deleteAssignment(user.studentId, id);
  }
}