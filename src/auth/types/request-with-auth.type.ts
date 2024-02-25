import { UserInfo } from './user-info.type';

export type AuthenticatedRequest = Request & {
  headers: {
    authorization?: string;
  };
  user: UserInfo;
};
