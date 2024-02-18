import { ApiProperty } from '@nestjs/swagger';
import { AssignmentData } from '../types/assignment-data';

export class AssignmentAttendanceDto {
  @ApiProperty({
    description: '과제 id. Ecampus에서 사용하는 id와 같습니다.',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '과제명',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '과제 마감일',
    type: Date,
  })
  endsAt!: Date | null;

  @ApiProperty({
    description: '과제 제출 여부',
    type: Boolean,
  })
  isDone!: boolean;

  @ApiProperty({
    description: '주차',
    type: Number,
  })
  week!: number;

  static from(assignment: AssignmentData) {
    return {
      id: assignment.id,
      name: assignment.name,
      endsAt: assignment.endsAt,
      isDone: assignment.users[0].isDone,
      week: assignment.week,
    };
  }
}

export class AssignmentAttendanceListDto {
  @ApiProperty({
    description: '과제별 출결 정보',
    type: [AssignmentAttendanceDto],
  })
  assignments!: AssignmentAttendanceDto[];

  static from(assignments: AssignmentData[]) {
    return {
      assignments: assignments.map((assignment) =>
        AssignmentAttendanceDto.from(assignment),
      ),
    };
  }
}
