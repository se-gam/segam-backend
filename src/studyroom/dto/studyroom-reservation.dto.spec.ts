import { StudyroomReservationDto } from './studyroom-reservation.dto';

describe('StudyroomReservationDto', () => {
  it('앱 예약 항목에 필요한 사용자 배열과 시간 값을 반환한다', () => {
    // Given
    const reservation = {
      id: 1,
      visitorId: '20260001',
      bookingId: '2026090105161688',
      roomName: 'S1층 05스터디룸',
      date: new Date('2026-09-01T00:00:00.000Z'),
      startsAt: '10:00',
      duration: 1,
      user: { studentId: '20260001', name: '예약자' },
    };

    // When
    const result = StudyroomReservationDto.from(reservation);

    // Then
    expect(result).toMatchObject({
      startsAt: 10,
      isLeader: true,
      users: [{ studentId: '20260001', name: '예약자' }],
    });
  });
});
