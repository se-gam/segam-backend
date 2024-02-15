import { IsString } from 'class-validator';

export class UserInfoPayload {
  @IsString()
  studentId!: string;

  @IsString()
  password!: string;
}
