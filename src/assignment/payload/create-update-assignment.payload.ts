import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";

export class CreateUpdateAssignmentPayload {
  @ApiProperty({
    description: '과제의 원본 강의 id',
    example: '2a22cfb9-86b1-4279-8fa7-d7383ede0c3e',
    type: String,
  })
  @IsString()
  courseId?: string;

  @ApiProperty({
    description: '과제 제목',
    example: 'Chapter 1 예제 풀이',
    type: String,
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: '과제 시작일',
    example: '2024-01-31T10:13:09.004Z',
    type: Date,
  })
  @Type(() => Date) 
  @IsDate()
  startsAt!: Date;

  @ApiProperty({
    description: '과제 마감일',
    example: '2024-02-28T10:13:09.004Z',
    type: Date,
  })
  @Type(() => Date) 
  @IsDate()
  endsAt!: Date;
}