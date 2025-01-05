import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { Notice } from './types/notice.type';

@Injectable()
export class NoticeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNotice(): Promise<Notice[]> {
    return this.prisma.notice.findMany();
  }
}
