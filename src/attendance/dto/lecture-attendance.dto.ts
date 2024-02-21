import { ApiProperty } from '@nestjs/swagger';
import { LectureData } from '../types/lecture-data';

export class LectureAttendanceDto {
  @ApiProperty({
    description: '강의 id. Ecampus에서 사용하는 id와 같습니다.',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '강의명',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '강의 오픈일',
    type: Date,
  })
  startsAt!: Date;

  @ApiProperty({
    description: '강의 마감일',
    type: Date,
  })
  endsAt!: Date | null;

  @ApiProperty({
    description: '강의 수강 여부',
    type: Boolean,
  })
  isDone!: boolean;

  @ApiProperty({
    description: '주차',
    type: Number,
  })
  week!: number;

  static from(lecture: LectureData) {
    return {
      id: lecture.id,
      name: lecture.name,
      startsAt: lecture.startsAt,
      endsAt: lecture.endsAt,
      isDone: lecture.users[0].isDone,
      week: lecture.week,
    };
  }
}

export class LectureAttendanceListDto {
  @ApiProperty({
    description: '강의별 출결 정보',
    type: [LectureAttendanceDto],
  })
  lectures!: LectureAttendanceDto[];

  static from(lectures: LectureData[]) {
    return {
      lectures: lectures.map((lecture) => LectureAttendanceDto.from(lecture)),
    };
  }
}
