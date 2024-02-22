import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserPayload {
  @IsString()
  @ApiProperty({
    description: '추가할 친구의 학번입니다',
    example: '17011584',
    type: String,
  })
  studentId!: string;
}
