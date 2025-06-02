export type AssignmentData = {
  id: string;
  name: string;
  week: number;
  endsAt?: Date;
  users: {
    isDone: boolean;
  }[];
};
