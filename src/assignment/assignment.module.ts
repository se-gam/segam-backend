import { Module } from '@nestjs/common';
import { AssignmentController } from './assignment.controller';
import { AssignmentRepository } from './assignment.repository';
import { AssignmentService } from './assignment.service';

@Module({
  providers: [
    AssignmentService,
    AssignmentRepository,
  ],
  controllers: [AssignmentController],
})
export class AssignmentModule {}
