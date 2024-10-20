import { AssignmentData } from './assignment-data';
import { LectureData } from './lecture-data';

export type CourseData = {
  id: string;
  courseId: string;
  ecampusId: number;
  name: string;
  lectures: LectureData[];
  assignments: AssignmentData[];
};
