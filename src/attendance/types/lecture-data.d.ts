export type LectureData = {
  id: number;
  name: string;
  week: number;
  startsAt: Date;
  endsAt: Date;
  users: {
    isDone: boolean;
  }[];
};
