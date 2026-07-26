import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosService } from './axios.service';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService studyroom API', () => {
  const response = { data: '{}', status: 200 };
  const endpointByKey: Record<string, string> = {
    GET_USER_RESERVATIONS_URL: 'https://external.test/studyroom/reservations',
    GET_USER_AVAILABILITY_URL: 'https://external.test/studyroom/availability',
    CREATE_RESERVATION_URL: 'https://external.test/studyroom/create',
    CANCEL_RESERVATION_URL: 'https://external.test/studyroom/cancel',
  };
  const date = new Date('2026-07-27T00:00:00+09:00');

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
      name: '예약 목록',
      endpoint: endpointByKey.GET_USER_RESERVATIONS_URL,
      body: { student_id: '20240001', password: 'secret' },
      invoke: () =>
        service.fetchStudyroomReservations({
          userId: '20240001',
          password: 'secret',
        }),
    },
    {
      name: '사용자 예약 가능 여부',
      endpoint: endpointByKey.GET_USER_AVAILABILITY_URL,
      body: {
        id: '23011583',
        password: 'secret',
        user_name: '김시윤',
        student_id: '23011583',
        year: 2026,
        month: '07',
        day: '27',
      },
      invoke: () =>
        service.fetchStudyroomAvailability({
          userId: '20240001',
          password: 'secret',
          friendName: '김빵빵',
          friendId: '23011583',
          date,
        }),
    },
    {
      name: '예약 생성',
      endpoint: endpointByKey.CREATE_RESERVATION_URL,
      body: {
        id: '20240001',
        password: 'secret',
        room_id: 1,
        users: [{ student_id: '23011583', name: '김빵빵' }],
        year: 2026,
        month: '07',
        day: '27',
        start_time: 10,
        hours: 2,
      },
      invoke: () =>
        service.createStudyroomReservation({
          userId: '20240001',
          password: 'secret',
          studyroomId: 1,
          users: [{ student_id: '23011583', name: '김빵빵' }],
          date,
          startsAt: 10,
          duration: 2,
        }),
    },
    {
      name: '예약 취소',
      endpoint: endpointByKey.CANCEL_RESERVATION_URL,
      body: {
        id: '20240001',
        password: 'secret',
        booking_id: 'booking-1',
        cancel_msg: '일정 변경',
      },
      invoke: () =>
        service.cancelStudyroomReservation({
          userId: '20240001',
          password: 'secret',
          bookingId: 'booking-1',
          cancelReason: '일정 변경',
        }),
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
