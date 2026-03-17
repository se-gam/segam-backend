export type RawStudyroomSlot = {
  date: Date;
  time: string;
  is_reserved: boolean;
  is_closed: boolean;
};

export type RawStudyroom = {
  room_name: string;
  slots: RawStudyroomSlot[];
};
