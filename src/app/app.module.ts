import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { StudyroomModule } from 'src/studyroom/studyroom.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CommonModule, StudyroomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
