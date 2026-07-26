export type PortalAuthenticationRequest = {
  readonly studentId: string;
  readonly password: string;
};

export type CourseAttendanceRequest = PortalAuthenticationRequest & {
  readonly name: string;
};

export type StudyroomCrawlerRequest = {
  readonly roomName: string;
};

export type StudentCredentials = {
  readonly userId: string;
  readonly password: string;
};

export type StudyroomAvailabilityRequest = StudentCredentials & {
  readonly friendId: string;
  readonly friendName: string;
  readonly date: Date;
};

export type StudyroomReservationUser = {
  readonly student_id: string;
  readonly name: string;
};

export type CreateStudyroomReservationRequest = StudentCredentials & {
  readonly studyroomId: number;
  readonly users: readonly StudyroomReservationUser[];
  readonly date: Date;
  readonly startsAt: number;
  readonly duration: number;
};

export type CancelStudyroomReservationRequest = StudentCredentials & {
  readonly bookingId: string;
  readonly cancelReason?: string;
};

export type CreateGodokReservationRequest = StudentCredentials & {
  readonly godokSlotId: string;
  readonly bookCode: number;
  readonly bookAreaCode: number;
};

export type CancelGodokReservationRequest = StudentCredentials & {
  readonly reservationId: string;
};
