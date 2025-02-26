import { ApiProperty } from "@nestjs/swagger";
import { StudyroomInfoListDto } from "src/studyroom/dto/studyroom-infp.dto";

export class StudyroomBatchInfoDto {
  @ApiProperty({
    description: '배치 실행 여부',
    type: Boolean,
  })
  isRunning: boolean;

  @ApiProperty({
    description: '배치 Cron 표현식',
    type: String,
  })
  cronTime: string;

  @ApiProperty({
    description: '배치 실행 시간',
    type: Date,
  })
  lastFiredAt: Date;
}
