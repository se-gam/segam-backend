import { Injectable } from "@nestjs/common";
import { CreateUpdateAssignmentPayload } from "./payload/create-update-assignment.payload";
import { UserInfo } from "src/auth/types/user-info.type";
import { AssignmentRepository } from "./assignment.repository";

@Injectable()
export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
  ) {}
  
  async createAssignment(user: UserInfo, payload: CreateUpdateAssignmentPayload) {
    return await this.assignmentRepository.createAssignment(user.studentId, payload);
  }

  async updateAssignment(user: UserInfo, id: number, payload: CreateUpdateAssignmentPayload) {
    return await this.assignmentRepository.updateAssignment(user.studentId, id, payload);
  }

  async deleteAssignment(user: UserInfo, id: number) {
    return await this.assignmentRepository.deleteAssignment(user.studentId, id);
  }
}