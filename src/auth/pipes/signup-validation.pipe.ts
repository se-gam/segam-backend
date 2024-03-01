import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from 'src/common/services/password.service';
import { PasswordPayload } from '../payload/password.payload';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}
  transform(
    value: PasswordPayload,
    metadata: ArgumentMetadata,
  ): PasswordPayload {
    if (this.configService.get('NODE_ENV') === 'local') {
      return value;
    }

    const pattern =
      /^[0-9a-fA-F]{32}:(?:[0-9a-fA-F]{32}|[0-9a-fA-F]{64}|[0-9a-fA-F]{96})$/;

    if (!pattern.test(value.password)) {
      throw new BadRequestException('비밀번호는 암호화된 문자열이어야 합니다.');
    }
    return {
      ...value,
      password: this.passwordService.decryptPassword(value.password),
    };
  }
}
