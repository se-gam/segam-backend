import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AxiosResponse } from 'axios';
import type {
  CancelGodokReservationRequest,
  CancelStudyroomReservationRequest,
  CourseAttendanceRequest,
  CreateGodokReservationRequest,
  CreateStudyroomReservationRequest,
  PortalAuthenticationRequest,
  StudentCredentials,
  StudyroomAvailabilityRequest,
  StudyroomCrawlerRequest,
} from '../types/external-api.type';
import { AxiosService } from './axios.service';

const EXTERNAL_API_ENDPOINTS = {
  portalAuthentication: 'PORTAL_AUTH_URL',
  courseAttendance: 'GET_COURSE_ATTENDANCE_URL',
  studyroomCrawler: 'CRAWLER_API_ROOT',
  studyroomReservations: 'GET_USER_RESERVATIONS_URL',
  studyroomAvailability: 'GET_USER_AVAILABILITY_URL',
  createStudyroomReservation: 'CREATE_RESERVATION_URL',
  cancelStudyroomReservation: 'CANCEL_RESERVATION_URL',
  godokCalendar: 'GET_GODOK_CALENDAR_URL',
  createGodokReservation: 'CREATE_GODOK_RESERVATION_URL',
  godokReservations: 'GET_USER_GODOK_RESERVATIONS_URL',
  cancelGodokReservation: 'CANCEL_GODOK_RESERVATION_URL',
  godokStatus: 'GET_USER_GODOK_STATUS_URL',
} as const;

type ExternalApiEndpoint =
  (typeof EXTERNAL_API_ENDPOINTS)[keyof typeof EXTERNAL_API_ENDPOINTS];

const GODOK_BOOK_LIST_URL =
  'http://classic.sejong.ac.kr/seletTermBookList.json';
const GODOK_TERM_ID = 'TERM-00571';
const JSON_REQUEST_CONFIG = {
  headers: { 'Content-Type': 'application/json' },
} as const;

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly axiosService: AxiosService,
    private readonly configService: ConfigService,
  ) {}

  authenticatePortal(
    request: PortalAuthenticationRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.portalAuthentication, {
      id: request.studentId,
      password: request.password,
    });
  }

  fetchCourseAttendance(
    request: CourseAttendanceRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.courseAttendance, {
      studentId: request.studentId,
      name: request.name,
      password: request.password,
    });
  }

  fetchStudyroom(
    request: StudyroomCrawlerRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.studyroomCrawler, {
      room_name: request.roomName,
    });
  }

  fetchStudyroomReservations(
    request: StudentCredentials,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.studyroomReservations, {
      student_id: request.userId,
      password: request.password,
    });
  }

  fetchStudyroomAvailability(
    request: StudyroomAvailabilityRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.studyroomAvailability, {
      id: request.userId,
      password: request.password,
      user_name: request.friendName,
      student_id: request.friendId,
      ...this.toDateParts(request.date),
    });
  }

  createStudyroomReservation(
    request: CreateStudyroomReservationRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.createStudyroomReservation, {
      id: request.userId,
      password: request.password,
      room_id: request.studyroomId,
      users: request.users,
      ...this.toDateParts(request.date),
      start_time: request.startsAt,
      hours: request.duration,
    });
  }

  cancelStudyroomReservation(
    request: CancelStudyroomReservationRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.cancelStudyroomReservation, {
      id: request.userId,
      password: request.password,
      booking_id: request.bookingId,
      cancel_msg: request.cancelReason,
    });
  }

  fetchGodokCalendar(): Promise<AxiosResponse<string>> {
    return this.axiosService.get<string>(
      this.getEndpoint(EXTERNAL_API_ENDPOINTS.godokCalendar),
    );
  }

  createGodokReservation(
    request: CreateGodokReservationRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.createGodokReservation, {
      student_id: request.userId,
      password: request.password,
      shInfoId: request.godokSlotId,
      bkCode: request.bookCode,
      bkAreaCode: request.bookAreaCode,
    });
  }

  fetchGodokReservations(
    request: StudentCredentials,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.godokReservations, {
      student_id: request.userId,
      password: request.password,
    });
  }

  fetchGodokBooks(bookAreaCode: number): Promise<AxiosResponse<string>> {
    const formData = new FormData();
    formData.append('opTermId', GODOK_TERM_ID);
    formData.append('bkAreaCode', bookAreaCode.toString());

    return this.axiosService.post<string>(GODOK_BOOK_LIST_URL, formData);
  }

  cancelGodokReservation(
    request: CancelGodokReservationRequest,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.cancelGodokReservation, {
      student_id: request.userId,
      password: request.password,
      opAppInfoId: request.reservationId,
    });
  }

  fetchGodokStatus(
    request: StudentCredentials,
  ): Promise<AxiosResponse<string>> {
    return this.postJson(EXTERNAL_API_ENDPOINTS.godokStatus, {
      student_id: request.userId,
      password: request.password,
    });
  }

  private postJson(
    endpoint: ExternalApiEndpoint,
    body: object,
  ): Promise<AxiosResponse<string>> {
    return this.axiosService.post<string>(
      this.getEndpoint(endpoint),
      JSON.stringify(body),
      JSON_REQUEST_CONFIG,
    );
  }

  private getEndpoint(endpoint: ExternalApiEndpoint): string {
    return this.configService.getOrThrow<string>(endpoint);
  }

  private toDateParts(date: Date) {
    return {
      year: date.getFullYear(),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
    };
  }
}
