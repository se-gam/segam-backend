import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserRepository } from 'src/user/user.repository';
import { ReservationService } from './reservation.service';
import { StudyroomController } from './studyroom.controller';
import { StudyroomRepository } from './studyroom.repository';
import { StudyroomService } from './studyroom.service';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StudyroomController],
  providers: [
    StudyroomService,
    StudyroomRepository,
    ReservationService,
    UserRepository,
    UserService,
  ],
})
export class StudyroomModule {}
