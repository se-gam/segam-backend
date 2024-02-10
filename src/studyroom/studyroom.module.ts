import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StudyroomController } from './studyroom.controller';
import { StudyroomRepository } from './studyroom.repository';
import { StudyroomService } from './studyroom.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StudyroomController],
  providers: [StudyroomService, StudyroomRepository],
})
export class StudyroomModule {}
