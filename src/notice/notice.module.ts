import { Module } from '@nestjs/common';
import { NoticeController } from './notice.controller';
import { NoticeRepository } from './notice.repository';
import { NoticeService } from './notice.service';

@Module({
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
})
export class NoticeModule {}
