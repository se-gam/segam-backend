import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import {
  AllExceptionsFilter,
  HttpExceptionFilter,
} from './common/exception/exception.filter';
import { DiscordService } from './common/services/discord.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  app.useGlobalFilters(
    new AllExceptionsFilter(
      app.get<HttpAdapterHost>(HttpAdapterHost),
      app.get<DiscordService>(DiscordService),
    ),
    new HttpExceptionFilter(app.get<DiscordService>(DiscordService)),
  );
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Segam Backend API')
    .setDescription('세감 백엔드 API 문서입니다.')
    .setVersion('1.0')
    .addTag('Segam')
    .addBearerAuth()
    .build();

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('delicious-segam-docs', app, document);

  await app.listen(3000);
}
bootstrap();
