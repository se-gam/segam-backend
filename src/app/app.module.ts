import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { StudyroomModule } from 'src/studyroom/studyroom.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './modules/config.module';

@Module({
  imports: [
    configModule,
    CommonModule,
    StudyroomModule,
    AuthModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
