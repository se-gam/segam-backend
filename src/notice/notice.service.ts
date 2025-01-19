import { Injectable, NotFoundException } from '@nestjs/common';
import { NoticeDto } from './dto/notice.dto';
import { NoticeRepository } from './notice.repository';
import { CreateUpdateNoticePayload } from './payload/create-update-notice.payload';
import { PaginationPayload } from './payload/pagination.payload';

@Injectable()
export class NoticeService {
  constructor(private readonly noticeRepository: NoticeRepository) {}

  async getNotice(): Promise<NoticeDto[]> {
    const notices = await this.noticeRepository.getNotice();

    return notices.map(NoticeDto.from);
  }

  async getNoticeById(id: number): Promise<NoticeDto> {
    const notice = await this.noticeRepository.getNoticeById(id);

    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');

    return NoticeDto.from(notice);
  }

  async getPopupNotice(): Promise<NoticeDto> {
    const notice = await this.noticeRepository.getPopupNotice();

    if (!notice) throw new NotFoundException('팝업 공지사항이 없습니다.');

    return NoticeDto.from(notice);
  }

  async createNotice(payload: CreateUpdateNoticePayload): Promise<void> {
    return this.noticeRepository.createNotice(payload);
  }

  async updateNotice(
    id: number,
    payload: CreateUpdateNoticePayload,
  ): Promise<void> {
    const notice = await this.noticeRepository.getNoticeById(id);

    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');

    return this.noticeRepository.updateNotice(id, payload);
  }

  async deleteNotice(id: number): Promise<void> {
    const notice = await this.noticeRepository.getNoticeById(id);

    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');

    return this.noticeRepository.deleteNotice(id);
  }

  async createPopupNotice(id: number): Promise<void> {
    const notice = await this.noticeRepository.getNoticeById(id);

    if (!notice) throw new NotFoundException('공지사항을 찾을 수 없습니다.');

    return this.noticeRepository.createPopupNotice(id);
  }

  async getNoticeByPagination(
    queryData: PaginationPayload,
  ): Promise<Partial<NoticeDto>[]> {
    const notice = await this.noticeRepository.getNoticeByPagination(
      queryData.skip,
      queryData.take,
    );

    return notice;
  }
}
