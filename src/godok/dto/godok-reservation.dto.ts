import { ApiProperty } from '@nestjs/swagger';
import { GodokReservationInfo } from '../types/godokReservationInfo.type';

export class GodokReservationDto {
  @ApiProperty({
    description: '고전독서 시험예약 id',
    example: 'OPAP-0000197302',
    type: String,
  })
  reservationId!: string;

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
    description: '응시 책 영역 id',
    example: 3000,
    type: Number,
  })
  bookCategoryId: number;

  @ApiProperty({
    description: '고전독서 시험예약 시간',
    type: Date,
  })
  reservationTime!: Date;

  static from(reservation: GodokReservationInfo): GodokReservationDto {
    return {
      reservationId: reservation.reservationId,
      bookId: reservation.bookId,
      bookName: reservation.book.title,
      bookCategoryId: reservation.book.bookCategory.id,
      reservationTime: reservation.startsAt,
    };
  }
}
