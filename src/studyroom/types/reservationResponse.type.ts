export type RawUser = {
  name: string;
  student_id: string;
};

export type ReservationResponse = {
  booking_id: string;
  ipid: string;
  room_id: string;
  duration: string;
  purpose: string;
  date: string;
  starts_at: string;
  users: RawUser[];
};
