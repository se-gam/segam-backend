import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExternalApiService } from 'src/common/services/external-api.service';
import { AuthRepository } from './auth.repository';
import { TokenDto } from './dto/token.dto';
import { SignUpPayload } from './payload/signup.payload';
import { TokenService } from './token.service';
import { PortalUserInfo } from './types/portal-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly externalApiService: ExternalApiService,
    private readonly authRepository: AuthRepository,
    // private readonly ecampusService: EcampusService,
  ) {}

  async signup(payload: SignUpPayload): Promise<TokenDto> {
    const res = await this.externalApiService.authenticatePortal({
      studentId: payload.studentId,
      password: payload.password,
    });

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
