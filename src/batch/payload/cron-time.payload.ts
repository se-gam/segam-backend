import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CronTimePayload {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cron 표현식',
    example: '*/2 * * * * *',
  })
  cronTime: string;
}
