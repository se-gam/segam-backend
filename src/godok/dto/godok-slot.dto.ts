import { ApiProperty } from '@nestjs/swagger';
import { GodokSlot } from '../types/godokSlot.type';

export class GodokSlotDto {
  @ApiProperty({
    description: '고전 독서 슬롯 id',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '고전 독서 슬롯 data_id',
    type: String,
  })
  slotId: string;

  @ApiProperty({
    description: '시험 날짜와 시간',
    type: Date,
  })
  startsAt!: Date;

  @ApiProperty({
    description: '잔여 좌석',
    type: Number,
  })
  availableSeats!: number;

  @ApiProperty({
    description: '총 좌석',
    type: Number,
  })
  totalSeats: number;

  static from(godokSlot: GodokSlot): GodokSlotDto {
    return {
      id: godokSlot.id,
      slotId: godokSlot.slotId,
      startsAt: godokSlot.startsAt,
      availableSeats: godokSlot.availableSeats,
      totalSeats: godokSlot.totalSeats,
    };
  }
}

export class GodokSlotListDto {
  @ApiProperty({
    description: '고전 독서 슬롯 목록',
    type: [GodokSlotDto],
  })
  godokSlots: GodokSlotDto[];

  // TODO : 날짜 - 시간으로 sort 해야함
  static from(godokSlots: GodokSlot[]): GodokSlotListDto {
    return {
      godokSlots: godokSlots.map((godokSlot) => {
        return GodokSlotDto.from(godokSlot);
      }),
    };
  }
}
