import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ExternalApiService } from '../common/services/external-api.service';
import { UserRepository } from '../user/user.repository';
import { StudyroomRepository } from './studyroom.repository';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  const studyroomRepository = {
    getReservationById: jest.fn(),
    updateReservations: jest.fn(),
  };
  const userRepository = {
    getUserByStudentId: jest.fn(),
    getUsersByStudentIds: jest.fn(),
  };
  const externalApiService = {
    cancelStudyroomReservation: jest.fn(),
    createStudyroomReservation: jest.fn(),
    fetchStudyroomReservations: jest.fn(),
  };

  let service: ReservationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: StudyroomRepository, useValue: studyroomRepository },
        { provide: UserRepository, useValue: userRepository },
        { provide: ExternalApiService, useValue: externalApiService },
      ],
    }).compile();

    service = moduleRef.get(ReservationService);
  });

  it('취소 API가 업무 실패를 반환하면 예약 삭제를 진행하지 않는다', async () => {
    // Given
    studyroomRepository.getReservationById.mockResolvedValue({
      visitorId: '20240001',
      bookingId: '2026081908103849',
    });
    externalApiService.cancelStudyroomReservation.mockResolvedValue({
      status: 200,
      result: {
        ok: false,
        resultCode: '1',
        resultMessage: '예약이 존재하지 않습니다.',
        reserveNo: '2026081908103849',
      },
    });

    // When
    const cancellation = service.cancelReservation(1, '20240001', {
      password: 'secret',
    });

    // Then
    await expect(cancellation).rejects.toBeInstanceOf(NotFoundException);
    expect(externalApiService.cancelStudyroomReservation).toHaveBeenCalledWith({
      userId: '20240001',
      password: 'secret',
      reserveNo: '2026081908103849',
      cancelReason: undefined,
    });
  });

  it('시간 또는 기간이 없는 외부 예약을 동기화 대상에서 제외한다', async () => {
    // Given
    userRepository.getUserByStudentId.mockResolvedValue({
      studentId: '20240001',
    });
    externalApiService.fetchStudyroomReservations.mockResolvedValue({
      status: 200,
      reservations: [
        {
          bookingId: null,
          ipid: null,
          roomName: 'S1층 08스터디룸',
          duration: null,
          date: '2026.08.19',
          startsAt: null,
        },
        {
          bookingId: 'booking-1',
          ipid: 'ipid-1',
          roomName: 'S1층 09스터디룸',
          duration: '2',
          date: '2026.08.20',
          startsAt: '10:00',
        },
      ],
    });

    // When
    await service.updateUserReservations('20240001', 'secret');

    // Then
    expect(studyroomRepository.updateReservations).toHaveBeenCalledWith(
      '20240001',
      [
        {
          booking_id: 'booking-1',
          ipid: 'ipid-1',
          room_name: 'S1층 09스터디룸',
          duration: '2',
          date: '2026.08.20',
          starts_at: '10:00',
        },
      ],
    );
  });

  it('프론트의 동반인 학번 배열을 외부 예약 API용 객체 배열로 변환한다', async () => {
    // Given
    userRepository.getUsersByStudentIds.mockResolvedValue([
      { studentId: '20260002', name: '친구' },
    ]);
    externalApiService.createStudyroomReservation.mockResolvedValue({
      status: 201,
      result: '예약 성공',
    });

    // When
    await service.createReservation('20260001', {
      studyroomId: 8,
      password: 'secret',
      startsAt: 10,
      duration: 1,
      reason: '스터디',
      users: ['20260002'],
      date: new Date('2026-08-31'),
    });

    // Then
    expect(externalApiService.createStudyroomReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        users: [{ student_id: '20260002', name: '친구' }],
      }),
    );
  });

  it('예약 목록의 외부 인증 실패 메시지를 그대로 반환한다', async () => {
    // Given
    userRepository.getUserByStudentId.mockResolvedValue({
      studentId: '20240001',
    });
    externalApiService.fetchStudyroomReservations.mockResolvedValue({
      status: 401,
      reservations: [],
      errorMessage: '포털 인증에 실패했습니다.',
    });

    // When
    const reservations = service.updateUserReservations('20240001', 'secret');

    // Then
    await expect(reservations).rejects.toEqual(
      new UnauthorizedException('포털 인증에 실패했습니다.'),
    );
  });
});
