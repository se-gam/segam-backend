import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';
import { Notice } from './types/notice.type';

@Injectable()
export class NoticeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNotice(): Promise<Notice[]> {
    return this.prisma.notice.findMany();
  }

  async getNoticeById(id: number): Promise<Notice | null> {
    return this.prisma.notice.findUnique({
      where: { id },
    });
  }

  async createNotice(payload: CreateUpdateNoticePayload): Promise<void> {
    await this.prisma.notice.create({
      data: {
        title: payload.title,
        content: payload.content,
        isPopup: payload.isPopup,
      },
    });
  }

  async updateNotice(
    id: number,
    payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    await this.prisma.notice.update({
      where: { id },
      data: {
        title: payload.title,
        content: payload.content,
        isPopup: payload.isPopup,
      },
    });
  }
}
