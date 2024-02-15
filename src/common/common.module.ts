import { Global, Module } from '@nestjs/common';
import { AxiosService } from './services/axios.service';
import { PasswordService } from './services/password.service';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  providers: [PrismaService, AxiosService, PasswordService],
  exports: [PrismaService, AxiosService, PasswordService],
})
export class CommonModule {}
