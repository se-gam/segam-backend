import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// 2612e4c61d4cf3003896ad3440f9745d:ac332969b6df952287ddeb78e5962b11

@ValidatorConstraint({ name: 'password', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(value: any, validationArguments?: ValidationArguments): boolean {
    if (process.env.NODE_ENV === 'local') {
      return true;
    }
    const pattern = /^[0-9a-fA-F]{32}:[0-9a-fA-F]{32}$/;
    return pattern.test(value);
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return '비밀번호는 암호화된 문자열이어야 합니다.';
  }
}
