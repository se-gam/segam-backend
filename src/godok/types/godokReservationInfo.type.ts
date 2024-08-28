export type GodokReservationInfo = {
  reservationId: string;
  studentId: string;
  bookId: number;
  startsAt: Date;
  book: {
    title: string;
    bookCategory: {
      id: number;
    };
  };
};
