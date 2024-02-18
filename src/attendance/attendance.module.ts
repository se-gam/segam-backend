import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';
import { EcampusService } from './ecampus.service';

@Module({
  providers: [
    EcampusService,
    AttendanceService,
    AttendanceRepository,
    EcampusService,
  ],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
