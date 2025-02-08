import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AdminApiStrategy } from './admin.strategy';
import { PasswordService } from 'src/common/services/password.service';

@Injectable()
export class AdminApiGuard implements CanActivate {
  constructor(
    private readonly adminApiStrategy: AdminApiStrategy,
    private readonly passwordService: PasswordService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const pattern =
      /^[0-9a-fA-F]{32}:(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{64}|[0-9a-fA-F]{96})$/;
    if (!pattern.test(request.headers['admin-api-key'])) {
      throw new BadRequestException('올바른 api key 형식이 아닙니다.');
    }

    const apiKey = this.passwordService.decryptPassword(
      request.headers['admin-api-key'],
    );
    const result = this.adminApiStrategy.validateApiKey(apiKey);
    if (!result) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
