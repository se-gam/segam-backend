import { StudyroomSlot } from '@prisma/client';

export type Studyroom = {
  id: number;
  name: string;
  location: string;
  minUsers: number;
  maxUsers: number;
  isCinema: boolean;
  operatingHours: string;
  slots: StudyroomSlot[];
};
