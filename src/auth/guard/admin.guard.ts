import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminApiStrategy } from './admin.strategy';

@Injectable()
export class AdminApiGuard implements CanActivate {
  constructor(private readonly adminApiStrategy: AdminApiStrategy) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers['admin-api-key'];
    const result = this.adminApiStrategy.validateApiKey(apiKey);
    if (!result) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
