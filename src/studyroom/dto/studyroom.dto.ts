import { Studyroom } from '../types/studyroom.type';
import { StudyroomSlotDto } from './studyroomslot.dto';

export class StudyroomDto {
  id!: number;
  name!: string;
  location!: string;
  minUsers!: number;
  maxUsers!: number;
  isCinema!: boolean;
  operatingHours!: string;
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
  studyrooms: StudyroomDto[];

  static from(studyrooms: Studyroom[]): StudyroomListDto {
    return {
      studyrooms: studyrooms.map((studyroom) => {
        return StudyroomDto.from(studyroom);
      }),
    };
  }
}
