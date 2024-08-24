import { ApiProperty } from '@nestjs/swagger';

export class GodokReservationDto {
  @ApiProperty({
    description: '고전독서 시험예약 id',
    example: 'OPAP-0000197302',
    type: Number,
  })
  reservationId!: number;

  @ApiProperty({
    description: '응시 책 id',
    example: 3003,
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '응시 책 이름',
    example: '췍',
    type: String,
  })
  bookName!: string;

  @ApiProperty({
    description: '고전독서 시험예약 시간',
    type: Date,
  })
  reservationTime!: Date;
}
