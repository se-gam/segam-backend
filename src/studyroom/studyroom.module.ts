import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StudyroomController } from './studyroom.controller';
import { StudyroomRepository } from './studyroom.repository';
import { StudyroomService } from './studyroom.service';
import { ReservationService } from './reservation.service';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StudyroomController],
  providers: [
    StudyroomService,
    StudyroomRepository,
    ReservationService,
    UserRepository,
  ],
})
export class StudyroomModule {}
