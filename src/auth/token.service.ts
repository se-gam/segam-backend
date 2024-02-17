import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './types/token-payload.type';
import { TokenSchema } from './types/token-schema.type';
import { JwtToken } from './types/tokens.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generateTokens(payload: TokenSchema): JwtToken {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenSchema {
    const data = this.jwtService.verify<TokenPayload>(token, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });

    const { iat, exp, ...result } = data;
    return result;
  }

  verifyRefreshToken(token: string): TokenSchema {
    const data = this.jwtService.verify<TokenPayload>(token, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });

    const { iat, exp, ...result } = data;
    return result;
  }

  private generateAccessToken(payload: TokenSchema): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE_TIME'),
    });
  }

  private generateRefreshToken(payload: TokenSchema): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRE_TIME',
      ),
    });
  }
}
