import { ApiProperty } from '@nestjs/swagger';
import { LectureInfo } from '../types/lecture-info';

export class LectureDto {
  @ApiProperty({
    description: '학수번호',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '강의명',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '주관 학과',
    type: String,
  })
  school!: string;

  static from(lecture: LectureInfo) {
    return {
      id: lecture.id,
      name: lecture.name,
      school: lecture.school,
    };
  }
}

export class LectureListDto {
  @ApiProperty({
    description: '강의 목록',
    type: [LectureDto],
  })
  lectures!: LectureDto[];

  static from(lectures: LectureInfo[]) {
    return {
      lectures: lectures.map((lecture) => LectureDto.from(lecture)),
    };
  }
}
