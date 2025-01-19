import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';
import { Notice } from './types/notice.type';

@Injectable()
export class NoticeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNotice(): Promise<Notice[]> {
    return this.prisma.notice.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPopupNotice(): Promise<Notice | null> {
    return this.prisma.notice.findFirst({
      where: {
        isPopup: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getNoticeById(id: number): Promise<Notice | null> {
    return this.prisma.notice.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async createNotice(payload: CreateUpdateNoticePayload): Promise<void> {
    await this.prisma.notice.create({
      data: {
        title: payload.title,
        content: payload.content,
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
      },
    });
  }

  async deleteNotice(id: number): Promise<void> {
    await this.prisma.notice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createPopupNotice(id: number): Promise<void> {
    await this.prisma.notice.updateMany({
      where: { isPopup: true },
      data: { isPopup: false },
    });

    await this.prisma.notice.update({
      where: { id },
      data: { isPopup: true },
    });
  }

  async getNoticeByPagination(
    skip: number,
    take: number,
  ): Promise<Partial<Notice>[]> {
    return this.prisma.notice.findMany({
      skip: skip,
      take: take,
      select: { title: true, createdAt: true },
    });
  }
}
