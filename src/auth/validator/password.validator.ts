import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

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
