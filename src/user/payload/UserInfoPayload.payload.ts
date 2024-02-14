import { IsString } from 'class-validator';

export class UserInfoPayload {
  @IsString()
  student_id!: string;

  @IsString()
  password!: string;
}
