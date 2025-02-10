export type StudyroomInfo = {
  id: number;
  name: string;
  location: string;
  minUsers: number;
  maxUsers: number;
  isCinema: boolean;
  operatingHours: string;
  tags: string[];
  lastUpdatedAt: Date;
};
