import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from 'src/common/services/discord.service';
import { ExternalApiService } from 'src/common/services/external-api.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { UserService } from 'src/user/user.service';
import { ReservationService } from './reservation.service';
import { StudyroomRepository } from './studyroom.repository';
import { StudyroomService } from './studyroom.service';

describe('StudyroomService', () => {
  it('스터디룸 친구 추가는 외부 API 호출 없이 친구 등록 서비스에 위임한다', async () => {
    // Given
    const addUserAsFriend = jest.fn();
    const fetchStudyroom = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        StudyroomService,
        { provide: PrismaService, useValue: {} },
        { provide: StudyroomRepository, useValue: {} },
        { provide: ReservationService, useValue: {} },
        { provide: ExternalApiService, useValue: { fetchStudyroom } },
        { provide: ConfigService, useValue: {} },
        { provide: DiscordService, useValue: {} },
        { provide: UserService, useValue: { addUserAsFriend } },
      ],
    }).compile();
    const service = moduleRef.get(StudyroomService);

    // When
    await service.addUserAsFriend(
      { studentId: '20260001', name: '요청자', sejongPid: 'pid-1' },
      { friendId: '20260002', friendName: '친구' },
    );

    // Then
    expect(addUserAsFriend).toHaveBeenCalledWith(
      { studentId: '20260002', name: '친구' },
      { studentId: '20260001', name: '요청자', sejongPid: 'pid-1' },
    );
    expect(fetchStudyroom).not.toHaveBeenCalled();
  });
});
