import { Global, Module } from '@nestjs/common';
import { AxiosService } from './services/axios.service';
import { DiscordService } from './services/discord.service';
import { ExternalApiService } from './services/external-api.service';
import { FcmService } from './services/fcm.service';
import { PasswordService } from './services/password.service';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  providers: [
    PrismaService,
    AxiosService,
    ExternalApiService,
    PasswordService,
    FcmService,
    DiscordService,
  ],
  exports: [
    PrismaService,
    ExternalApiService,
    PasswordService,
    FcmService,
    DiscordService,
  ],
})
export class CommonModule {}
