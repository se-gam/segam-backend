import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AttendanceModule } from 'src/attendance/attendance.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommonModule } from 'src/common/common.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { StudyroomModule } from 'src/studyroom/studyroom.module';
import { UserModule } from 'src/user/user.module';
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
    UserModule,
    RestaurantModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
