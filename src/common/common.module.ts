import { Global, Module } from '@nestjs/common';
import { AxiosService } from './services/axios.service';
import { FcmService } from './services/fcm.service';
import { PasswordService } from './services/password.service';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  providers: [PrismaService, AxiosService, PasswordService, FcmService],
  exports: [PrismaService, AxiosService, PasswordService, FcmService],
})
export class CommonModule {}
