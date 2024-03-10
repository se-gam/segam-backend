export type AssignmentData = {
  id: number;
  name: string;
  week: number;
  endsAt?: Date;
  users: {
    isDone: boolean;
  }[];
};
