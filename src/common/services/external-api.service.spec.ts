import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosService } from './axios.service';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService', () => {
  const response = { data: '{}', status: 200 };
  const endpointByKey: Record<string, string> = {
    PORTAL_AUTH_URL: 'https://external.test/portal-auth',
    GET_COURSE_ATTENDANCE_URL: 'https://external.test/course-attendance',
    CRAWLER_API_ROOT: 'https://external.test/studyroom-crawler',
  };

  let service: ExternalApiService;
  let post: jest.Mock;

  beforeEach(async () => {
    post = jest.fn().mockResolvedValue(response);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        { provide: AxiosService, useValue: { get: jest.fn(), post } },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => endpointByKey[key]),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(ExternalApiService);
  });

  it.each([
    {
      name: '포털 인증',
      endpoint: endpointByKey.PORTAL_AUTH_URL,
      body: { id: '20240001', password: 'secret' },
      invoke: () =>
        service.authenticatePortal({
          studentId: '20240001',
          password: 'secret',
        }),
    },
    {
      name: '출석 조회',
      endpoint: endpointByKey.GET_COURSE_ATTENDANCE_URL,
      body: { studentId: '20240001', name: '홍길동', password: 'secret' },
      invoke: () =>
        service.fetchCourseAttendance({
          studentId: '20240001',
          name: '홍길동',
          password: 'secret',
        }),
    },
    {
      name: '스터디룸 크롤링',
      endpoint: endpointByKey.CRAWLER_API_ROOT,
      body: { room_name: '대양AI센터 B205' },
      invoke: () => service.fetchStudyroom({ roomName: '대양AI센터 B205' }),
    },
  ])(
    '$name 요청을 외부 규격으로 전송한다',
    async ({ endpoint, body, invoke }) => {
      // Given
      post.mockClear();

      // When
      const result = await invoke();

      // Then
      expect(post).toHaveBeenCalledWith(endpoint, JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toBe(response);
    },
  );
});
