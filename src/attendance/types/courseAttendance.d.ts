export type CourseAttendance = {
  id: string;
  name: string;
  ecampusId: number;
  lectures: RawLecture[];
  assignments: RawAssignment[];
};
