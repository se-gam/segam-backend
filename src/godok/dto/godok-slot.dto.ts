import { ApiProperty } from '@nestjs/swagger';
import { GodokSlot } from '../types/godokSlot.type';

import * as _ from 'lodash';

export class GodokSlotDto {
  @ApiProperty({
    description: '고전 독서 슬롯 id',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: '고전 독서 슬롯 id (학교 서버) 다 차있는 경우 id가 null임',
    type: String,
  })
  slotId!: string | null;

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
  totalSeats!: number;

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
    type: Object,
    example: {
      godokSlots: {
        '2024-08-26': [
          {
            id: '7380cde2-d4c6-4240-b4cd-34d0d6b3eac7',
            slotId: 'SCHU_24051314224746959',
            startsAt: '2024-08-26T02:00:00.000Z',
            availableSeats: 5,
            totalSeats: 16,
            createdAt: '2024-08-24T15:19:50.767Z',
            updatedAt: '2024-08-24T17:26:01.676Z',
            deletedAt: null,
          },
        ],
        '2024-08-27': [],
      },
    },
  })
  godokSlots: Record<string, GodokSlot[]>;

  static from(godokSlots: GodokSlot[]): GodokSlotListDto {
    return {
      godokSlots: _.groupBy(
        godokSlots,
        (godokSlot) => godokSlot.startsAt.toISOString().split('T')[0],
      ),
    };
  }
}
