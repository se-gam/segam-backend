import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosService } from 'src/common/services/axios.service';
import { AuthRepository } from './auth.repository';
import { TokenDto } from './dto/token.dto';
import { SignUpPayload } from './payload/signup.payload';
import { TokenService } from './token.service';
import { PortalUserInfo } from './types/portal-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
    private readonly authRepository: AuthRepository,
    // private readonly ecampusService: EcampusService,
  ) {}

  async signup(payload: SignUpPayload): Promise<TokenDto> {
    const res = await this.axiosService.post(
      this.configService.get('PORTAL_AUTH_URL'),
      JSON.stringify({
        id: payload.studentId,
        password: payload.password,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (res.status !== 200) {
      throw new UnauthorizedException(
        '학번 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const portalUserInfo = JSON.parse(res.data) as PortalUserInfo;
    const user = await this.authRepository.getOrCreateUser(
      portalUserInfo,
      payload,
    );

    // 로그인 시 출석 정보 업데이트
    // await this.ecampusService.updateUserAttendance(user, payload);

    return this.tokenService.generateTokens({ studentId: user.studentId });
  }

  async refresh(refreshToken: string): Promise<TokenDto> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      return this.tokenService.generateTokens(payload);
    } catch (e) {
      throw new UnauthorizedException(
        '토큰이 만료되었거나, 잘못된 토큰입니다.',
      );
    }
  }
}
