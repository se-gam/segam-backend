import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { ReservationService } from 'src/studyroom/reservation.service';
import { StudyroomRepository } from 'src/studyroom/studyroom.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    ReservationService,
    StudyroomRepository,
  ],
})
export class UserModule {}
