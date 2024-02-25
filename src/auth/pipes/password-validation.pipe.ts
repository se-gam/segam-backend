import { ArgumentMetadata, Injectable } from '@nestjs/common';
import { SignUpPayload } from '../payload/signup.payload';
import { PasswordValidationPipe } from './signup-validation.pipe';

@Injectable()
export class SignUpValidationPipe extends PasswordValidationPipe {
  transform(value: SignUpPayload, metadata: ArgumentMetadata): SignUpPayload {
    return {
      studentId: value.studentId,
      password: super.transform({ password: value.password }, metadata)
        .password,
      os: value.os,
      pushToken: value.pushToken,
    };
  }
}
