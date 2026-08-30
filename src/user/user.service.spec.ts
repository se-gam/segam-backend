import { Test } from '@nestjs/testing';
import { DiscordService } from 'src/common/services/discord.service';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  it('이미 등록된 친구를 스터디룸 동반 이용자로 보장하면 성공한다', async () => {
    // Given
    const userRepository = {
      getUserByStudentId: jest.fn().mockResolvedValue({
        studentId: '20260002',
        name: '친구',
        sejongPid: 'pid-2',
      }),
      getFriendRelation: jest.fn().mockResolvedValue({
        id: 1,
        deletedAt: null,
      }),
      addUserAsFriend: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepository },
        { provide: DiscordService, useValue: {} },
      ],
    }).compile();
    const service = moduleRef.get(UserService);

    // When
    await service.ensureUserAsFriend(
      { studentId: '20260002', name: '친구' },
      { studentId: '20260001', name: '요청자', sejongPid: 'pid-1' },
    );

    // Then
    expect(userRepository.addUserAsFriend).not.toHaveBeenCalled();
  });
});
