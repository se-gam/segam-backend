import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosService } from 'src/common/services/axios.service';
import { PasswordService } from 'src/common/services/password.service';
import { TokenDto } from './dto/token.dto';
import { SignUpPayload } from './payload/signup.payload';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
    private readonly passwordService: PasswordService,
  ) {}

  async signup(payload: SignUpPayload): Promise<TokenDto> {
    const res = await this.axiosService.post(
      this.configService.get('PORTAL_AUTH_URL'),
      JSON.stringify({
        id: payload.studentId,
        password:
          this.configService.get('NODE_ENV') === 'local'
            ? payload.password
            : this.passwordService.decryptPassword(payload.password),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // TODO 유저 생성 or get

    if (res.status !== 200) {
      throw new UnauthorizedException(
        '학번 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // TODO: DB 유저로 토큰 생성
    return this.tokenService.generateTokens({ studentId: payload.studentId });
  }

  async refresh(refreshToken: string): Promise<TokenDto> {
    try {
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      return this.tokenService.generateTokens(payload);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(
        '토큰이 만료되었거나, 잘못된 토큰입니다.',
      );
    }
  }
}
