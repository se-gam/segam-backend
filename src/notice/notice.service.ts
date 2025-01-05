import { Injectable } from '@nestjs/common';
import { NoticeRepository } from './notice.repository';
import { Notice } from './types/notice.type';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNotice(): Promise<Notice[]> {
    return this.noticeRepository.getNotice();
  }
}
