export type RawGodokSlotItem = {
  data_id: string;
  date_time: string;
  available_seats: number;
  total_seats: number;
};

export type RawGodokSlot = RawGodokSlotItem[];
