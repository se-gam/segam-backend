import { StudyroomSlot } from '../types/studyroomSlot.type';

export class StudyroomSlotDto {
  id!: string;
  date!: Date;
  startsAt!: number;
  isReserved!: boolean;
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
