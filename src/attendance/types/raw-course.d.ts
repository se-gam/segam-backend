export type RawCourse = {
  id: string;
  name: string;
  ecampusId: number;
  lectures: RawLecture[];
  assignments: RawAssignment[];
};
