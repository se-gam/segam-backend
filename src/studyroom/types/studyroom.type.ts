import { StudyroomSlot } from './studyroomSlot.type';

export type Studyroom = {
  id: number;
  name: string;
  location: string;
  minUsers: number;
  maxUsers: number;
  isCinema: boolean;
  operatingHours: string;
  tags: string[];
  slots: StudyroomSlot[];
};
