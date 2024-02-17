import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../types/request-with-auth.type';
import { UserInfo } from '../types/user-info.type';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): UserInfo => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    return request.user as UserInfo;
  },
);
