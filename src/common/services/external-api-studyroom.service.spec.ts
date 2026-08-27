import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosService } from './axios.service';
import { ExternalApiService } from './external-api.service';

describe('ExternalApiService studyroom API', () => {
  const response = { data: '{}', status: 200 };
  const endpointByKey: Record<string, string> = {
    CRAWLER_API_ROOT: 'https://external.test/studyroom/crawler',
    GET_USER_RESERVATIONS_URL: 'https://external.test/studyroom/reservations',
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

  it('스터디룸 크롤링 요청을 외부 규격으로 전송한다', async () => {
    // Given
    // When
    const result = await service.fetchStudyroom({
      roomName: '스터디룸 02',
    });

    // Then
    expect(post).toHaveBeenCalledWith(
      endpointByKey.CRAWLER_API_ROOT,
      JSON.stringify({ room_name: '스터디룸 02' }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        validateStatus: expect.any(Function),
      }),
    );
    expect(result).toBe(response);
  });

  it('예약 목록 응답을 타입이 지정된 예약 DTO 배열로 직렬화한다', async () => {
    // Given
    post.mockResolvedValueOnce({
      data: JSON.stringify({
        result: [
          {
            booking_id: 'booking-1',
            ipid: 'ipid-1',
            room_name: '대양AI센터 B205',
            duration: null,
            date: '2026.07.27',
            starts_at: null,
          },
        ],
      }),
      status: 200,
    });

    // When
    const result = await service.fetchStudyroomReservations({
      userId: '20240001',
      password: 'secret',
    });

    // Then
    expect(post).toHaveBeenCalledWith(
      endpointByKey.GET_USER_RESERVATIONS_URL,
      JSON.stringify({ student_id: '20240001', password: 'secret' }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        validateStatus: expect.any(Function),
      }),
    );
    expect(result).toEqual({
      status: 200,
      reservations: [
        {
          bookingId: 'booking-1',
          ipid: 'ipid-1',
          roomName: '대양AI센터 B205',
          duration: null,
          date: '2026.07.27',
          startsAt: null,
        },
      ],
    });
  });

  it('예약 생성 응답을 DTO로 직렬화한다', async () => {
    // Given
    post.mockResolvedValueOnce({
      data: '{"result":"예약되었습니다"}',
      status: 200,
    });

    // When
    const result = await service.createStudyroomReservation({
      userId: '20240001',
      password: 'secret',
      studyroomId: 1,
      users: [{ student_id: '23011583', name: '김빵빵' }],
      date,
      startsAt: 10,
      duration: 2,
    });

    // Then
    expect(post).toHaveBeenCalledWith(
      endpointByKey.CREATE_RESERVATION_URL,
      JSON.stringify({
        id: '20240001',
        password: 'secret',
        room_id: 1,
        users: [{ student_id: '23011583', name: '김빵빵' }],
        year: 2026,
        month: '07',
        day: '27',
        start_time: 10,
        hours: 2,
      }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        validateStatus: expect.any(Function),
      }),
    );
    expect(result).toEqual({ status: 200, result: '예약되었습니다' });
  });

  it('예약 생성의 이용자 검증 오류를 DTO로 직렬화한다', async () => {
    // Given
    post.mockResolvedValueOnce({
      data: '{"error":"이름과 학번이 일치하지 않는 이용자가 있습니다.","content":"23011078-남정우"}',
      status: 422,
    });

    // When
    const result = await service.createStudyroomReservation({
      userId: '20240001',
      password: 'secret',
      studyroomId: 1,
      users: [{ student_id: '23011078', name: '남정우' }],
      date,
      startsAt: 10,
      duration: 2,
    });

    // Then
    expect(result).toEqual({
      status: 422,
      result: '',
      error: '이름과 학번이 일치하지 않는 이용자가 있습니다.',
      content: '23011078-남정우',
    });
  });

  it('예약 취소 응답을 DTO로 직렬화하고 reserve_no를 전송한다', async () => {
    // Given
    post.mockResolvedValueOnce({
      data: '{"result":{"ok":true,"resultCode":"0","resultMsg":"예약이 취소되었습니다.","reserveNo":"2026081908103849"}}',
      status: 200,
    });

    // When
    const result = await service.cancelStudyroomReservation({
      userId: '20240001',
      password: 'secret',
      reserveNo: '2026081908103849',
      cancelReason: '일정 변경',
    });

    // Then
    expect(post).toHaveBeenCalledWith(
      endpointByKey.CANCEL_RESERVATION_URL,
      JSON.stringify({
        id: '20240001',
        password: 'secret',
        reserve_no: '2026081908103849',
        cancel_msg: '일정 변경',
      }),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
        validateStatus: expect.any(Function),
      }),
    );
    expect(result).toEqual({
      status: 200,
      result: {
        ok: true,
        resultCode: '0',
        resultMessage: '예약이 취소되었습니다.',
        reserveNo: '2026081908103849',
      },
    });
  });
});
