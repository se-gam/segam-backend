import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AdminApiGuard } from 'src/auth/guard/admin.guard';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PasswordValidationPipe } from 'src/auth/pipes/signup-validation.pipe';
import { StudyroomController } from './studyroom.controller';
import { StudyroomService } from './studyroom.service';

describe('StudyroomController', () => {
  const authenticatedUser = {
    studentId: '20260001',
    name: '요청자',
    sejongPid: 'pid-1',
  };
  const studyroomService = {
    addUserAsFriend: jest.fn(),
    reserveStudyroom: jest.fn(),
  };
  let app: INestApplication;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Given
    const moduleRef = await Test.createTestingModule({
      controllers: [StudyroomController],
      providers: [{ provide: StudyroomService, useValue: studyroomService }],
    })
      .overrideGuard(AdminApiGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = authenticatedUser;
          return true;
        },
      })
      .overridePipe(PasswordValidationPipe)
      .useValue({ transform: (value: unknown) => value })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableVersioning({ type: VersioningType.URI, prefix: 'v' });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('친구 추가 요청이면 외부 검증 없이 친구 등록을 위임한다', async () => {
    // When
    await request(app.getHttpServer())
      .post('/v1/studyroom/user')
      .send({
        friendId: '20260002',
        friendName: '친구',
        password: 'unused-password',
        date: '2026-08-28',
      })
      .expect(201);

    // Then
    expect(studyroomService.addUserAsFriend).toHaveBeenCalledWith(
      authenticatedUser,
      expect.objectContaining({
        friendId: '20260002',
        friendName: '친구',
        password: 'unused-password',
      }),
    );
  });

  it('기존 프론트의 예약 요청을 허용한다', async () => {
    // When
    await request(app.getHttpServer())
      .post('/v1/studyroom/reservation')
      .send({
        studyroomId: 8,
        password: 'unused-password',
        startsAt: 10,
        duration: 1,
        reason: '스터디',
        users: ['20260002'],
        date: '2026-08-31T00:00:00.000Z',
      })
      .expect(201);

    // Then
    expect(studyroomService.reserveStudyroom).toHaveBeenCalledWith(
      authenticatedUser.studentId,
      expect.objectContaining({
        reason: '스터디',
        users: ['20260002'],
      }),
    );
  });
});
