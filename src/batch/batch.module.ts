import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  controllers: [BatchController],
  providers: [BatchService]
})
export class BatchModule {}
