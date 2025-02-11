import { ApiProperty } from '@nestjs/swagger';
import { StudyroomInfo } from '../types/studyroomInfo.type';

export class StudyroomInfoDto {
  @ApiProperty({
    description: '스터디룸 id',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '스터디룸 이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '위치',
    type: String,
  })
  location!: string;
  @ApiProperty({
    description: '최소 인원',
    type: Number,
  })
  minUsers!: number;

  @ApiProperty({
    description: '최대 인원',
    type: Number,
  })
  maxUsers!: number;

  @ApiProperty({
    description: '스터디룸 유형',
    type: Boolean,
  })
  isCinema!: boolean;

  @ApiProperty({
    description: '운영 시간',
    type: String,
  })
  operatingHours!: string;

  @ApiProperty({
    description: '스터디룸 태그',
    type: [String],
  })
  tags!: string[];

  @ApiProperty({
    description: '스터디룸 활성화 여부',
    type: Boolean,
  })
  isActive!: boolean;

  @ApiProperty({
    description: '스터디룸 마지막 업데이트 시간',
    type: Date,
  })
  lastUpdatedAt!: Date;

  static from(studyroom: StudyroomInfo): StudyroomInfoDto {
    return {
      id: studyroom.id,
      name: studyroom.name,
      location: studyroom.location,
      minUsers: studyroom.minUsers,
      maxUsers: studyroom.maxUsers,
      isCinema: studyroom.isCinema,
      operatingHours: studyroom.operatingHours,
      tags: studyroom.tags,
      isActive: studyroom.isActive,
      lastUpdatedAt: studyroom.lastUpdatedAt,
    };
  }
}

export class StudyroomInfoListDto {
  @ApiProperty({
    description: '스터디룸 목록',
    type: [StudyroomInfoDto],
  })
  studyrooms: StudyroomInfoDto[];

  static from(studyrooms: StudyroomInfo[]): StudyroomInfoListDto {
    return {
      studyrooms: studyrooms.map((studyroom) => {
        return StudyroomInfoDto.from(studyroom);
      }),
    };
  }
}
