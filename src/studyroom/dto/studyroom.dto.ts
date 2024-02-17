import { ApiProperty } from '@nestjs/swagger';
import { Studyroom } from '../types/studyroom.type';
import { StudyroomSlotDto } from './studyroomSlot.dto';

export class StudyroomDto {
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
    description: '스터디룸 slot 정보',
    type: [StudyroomSlotDto],
  })
  slots!: StudyroomSlotDto[];

  static from(studyroom: Studyroom): StudyroomDto {
    return {
      id: studyroom.id,
      name: studyroom.name,
      location: studyroom.location,
      minUsers: studyroom.minUsers,
      maxUsers: studyroom.maxUsers,
      isCinema: studyroom.isCinema,
      operatingHours: studyroom.operatingHours,
      slots: studyroom.slots,
    };
  }
}

export class StudyroomListDto {
  @ApiProperty({
    description: '스터디룸 목록',
    type: [StudyroomDto],
  })
  studyrooms: StudyroomDto[];

  static from(studyrooms: Studyroom[]): StudyroomListDto {
    return {
      studyrooms: studyrooms.map((studyroom) => {
        return StudyroomDto.from(studyroom);
      }),
    };
  }
}
