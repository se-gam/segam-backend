import { User } from '../type/user.type';

export class UserDto {
  studentId!: string;
  name!: string;
  departmentId?: number;

  static from(user: User): UserDto {
    return {
      studentId: user.studentId,
      name: user.name,
      departmentId: user.departmentId,
    };
  }
}
