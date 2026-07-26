import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosService } from './axios.service';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService godok API', () => {
  const response = { data: '{}', status: 200 };
  const endpointByKey: Record<string, string> = {
    GET_GODOK_CALENDAR_URL: 'https://external.test/godok/calendar',
    CREATE_GODOK_RESERVATION_URL: 'https://external.test/godok/create',
    GET_USER_GODOK_RESERVATIONS_URL: 'https://external.test/godok/reservations',
    CANCEL_GODOK_RESERVATION_URL: 'https://external.test/godok/cancel',
    GET_USER_GODOK_STATUS_URL: 'https://external.test/godok/status',
  };

  let service: ExternalApiService;
  let get: jest.Mock;
  let post: jest.Mock;

  beforeEach(async () => {
    get = jest.fn().mockResolvedValue(response);
    post = jest.fn().mockResolvedValue(response);

    const moduleRef = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        { provide: AxiosService, useValue: { get, post } },
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

  it('고전독서 캘린더를 GET으로 조회한다', async () => {
    // Given
    get.mockClear();

    // When
    const result = await service.fetchGodokCalendar();

    // Then
    expect(get).toHaveBeenCalledWith(endpointByKey.GET_GODOK_CALENDAR_URL);
    expect(result).toBe(response);
  });

  it.each([
    {
      name: '예약 생성',
      endpoint: endpointByKey.CREATE_GODOK_RESERVATION_URL,
      body: {
        student_id: '20240001',
        password: 'secret',
        shInfoId: 'slot-1',
        bkCode: 11,
        bkAreaCode: 1000,
      },
      invoke: () =>
        service.createGodokReservation({
          userId: '20240001',
          password: 'secret',
          godokSlotId: 'slot-1',
          bookCode: 11,
          bookAreaCode: 1000,
        }),
    },
    {
      name: '예약 목록',
      endpoint: endpointByKey.GET_USER_GODOK_RESERVATIONS_URL,
      body: { student_id: '20240001', password: 'secret' },
      invoke: () =>
        service.fetchGodokReservations({
          userId: '20240001',
          password: 'secret',
        }),
    },
    {
      name: '예약 취소',
      endpoint: endpointByKey.CANCEL_GODOK_RESERVATION_URL,
      body: {
        student_id: '20240001',
        password: 'secret',
        opAppInfoId: 'reservation-1',
      },
      invoke: () =>
        service.cancelGodokReservation({
          userId: '20240001',
          password: 'secret',
          reservationId: 'reservation-1',
        }),
    },
    {
      name: '사용자 상태',
      endpoint: endpointByKey.GET_USER_GODOK_STATUS_URL,
      body: { student_id: '20240001', password: 'secret' },
      invoke: () =>
        service.fetchGodokStatus({
          userId: '20240001',
          password: 'secret',
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

  it('고전독서 도서 목록을 FormData로 조회한다', async () => {
    // Given
    post.mockImplementation(async (url: string, formData: FormData) => {
      expect(url).toBe('http://classic.sejong.ac.kr/seletTermBookList.json');
      expect(formData.get('opTermId')).toBe('TERM-00571');
      expect(formData.get('bkAreaCode')).toBe('1000');
      return response;
    });

    // When
    const result = await service.fetchGodokBooks(1000);

    // Then
    expect(post).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });
});
