import { Injectable, NotFoundException } from '@nestjs/common';
import { NoticeDto } from './dto/notice.dto';
import { NoticeRepository } from './notice.repository';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNotice(): Promise<NoticeDto[]> {
    const notices = await this.noticeRepository.getNotice();

    return notices.map(NoticeDto.from);
  }

  async createNotice(payload: CreateUpdateNoticePayload): Promise<void> {
    return this.noticeRepository.createNotice(payload);
  }

  async updateNotice(
    id: number,
    payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    const notice = await this.noticeRepository.getNoticeById(id);

    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    return this.noticeRepository.updateNotice(id, payload);
  }
}
