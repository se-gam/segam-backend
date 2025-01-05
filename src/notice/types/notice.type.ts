export type Notice = {
  id: number;
  title: string;
  content: string;
  isPopup: boolean;
  createdAt: Date;
  deletedAt: Date | null;
};
