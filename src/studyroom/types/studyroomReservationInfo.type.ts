export type StudyroomReservationInfo = {
  id: number;
  studyroom: {
    name: string;
    isCinema: boolean;
  };
  users: {
    user: {
      name: string;
      studentId: string;
    };
    isLeader: boolean;
  }[];
  slots: {
    studyroomSlot: {
      date: Date;
      startsAt: number;
    };
  }[];
  reserveReason: string;
};
