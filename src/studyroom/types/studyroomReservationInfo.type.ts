export type StudyroomReservationInfo = {
  id: number;
  visitorId: string;
  bookingId: string | null;
  roomName: string;
  date: Date;
  startsAt: string;
  duration: number;
  user: {
    studentId: string;
    name: string;
  };
};
