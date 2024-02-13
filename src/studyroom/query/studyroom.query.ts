import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsInt, IsString, isInt } from 'class-validator';

export class StudyroomQuery {
  @Type(() => Date)
  @IsDate()
  date!: Date;

  @Type(() => Number)
  @IsInt()
  timeGte!: number;
  /*
  TODO
  이런 필터 옵션들은 Optional로 받는 것이 좋습니당
  값이 안들어왔을 때는 디폴트로 예를들어 여기에는 오늘날짜, 모든 인원수로 보여지게 하는 식으로 설계하는 것이 조와요
  */
  @Type(() => Number)
  @IsInt()
  timeLte!: number;

  @Type(() => Number)
  @IsInt()
  userCount!: number;
}
