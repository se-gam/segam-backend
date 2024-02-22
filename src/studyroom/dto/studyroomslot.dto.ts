import { ApiProperty } from '@nestjs/swagger';
import { StudyroomSlot } from '../types/studyroomSlot.type';

export class StudyroomSlotDto {
  @ApiProperty({
    description: '스터디룸 slot id',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '날짜',
    type: Date,
  })
  date!: Date;

  @ApiProperty({
    description: '시간',
    type: Number,
  })
  startsAt!: number;

  @ApiProperty({
    description: '예약 여부',
    type: Boolean,
  })
  isReserved!: boolean;

  @ApiProperty({
    description: '폐관 여부',
    type: Boolean,
  })
  isClosed!: boolean;

  static from(slots: StudyroomSlot[]): StudyroomSlotDto[] {
    return slots.map((slot) => {
      return {
        id: slot.id,
        date: slot.date,
        startsAt: slot.startsAt,
        isReserved: slot.isReserved,
        isClosed: slot.isClosed,
      };
    });
  }
}
