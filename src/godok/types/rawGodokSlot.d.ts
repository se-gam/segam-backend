export type RawGodokSlotItem = {
  data_id: string;
  date: string;
  time: string;
  available_seats: string;
  total_seats: string;
};

export type RawDateSlot = {
  date: string;
  slots: RawGodokSlotItem[];
};

export type RawGodokSlot = RawDateSlot[];
