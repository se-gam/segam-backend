import { Module } from '@nestjs/common';
import { NoticeController } from './notice.controller';
import { NoticeRepository } from './notice.repository';
import { NoticeService } from './notice.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeRepository],
})
export class NoticeModule {}
