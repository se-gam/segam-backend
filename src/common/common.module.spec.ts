import { Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { CommonModule } from './common.module';
import { AxiosService } from './services/axios.service';
import { DiscordService } from './services/discord.service';
import { ExternalApiService } from './services/external-api.service';
import { FcmService } from './services/fcm.service';
import { PasswordService } from './services/password.service';

@Injectable()
class ExternalApiConsumer {
  constructor(private readonly externalApiService: ExternalApiService) {}

  authenticate() {
    return this.externalApiService.authenticatePortal({
      studentId: '20240001',
      password: 'secret',
    });
  }
}

describe('CommonModule', () => {
  it('다른 모듈의 서비스에 ExternalApiService를 주입한다', async () => {
    // Given
    const response = { data: '{}', status: 200 };
    const post = jest.fn().mockResolvedValue(response);
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({ PORTAL_AUTH_URL: 'https://external.test/portal-auth' }),
          ],
        }),
        CommonModule,
      ],
      providers: [ExternalApiConsumer],
    })
      .overrideProvider(AxiosService)
      .useValue({ get: jest.fn(), post })
      .overrideProvider(DiscordService)
      .useValue({})
      .overrideProvider(FcmService)
      .useValue({})
      .overrideProvider(PasswordService)
      .useValue({})
      .compile();
    const consumer = moduleRef.get(ExternalApiConsumer);

    // When
    const result = await consumer.authenticate();

    // Then
    expect(result).toBe(response);
    expect(post).toHaveBeenCalledWith(
      'https://external.test/portal-auth',
      JSON.stringify({ id: '20240001', password: 'secret' }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  });
});
