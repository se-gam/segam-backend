import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/common/services/prisma.service';
import { TokenSchema } from '../types/token-schema.type';
import { UserInfo } from '../types/user-info.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(data: TokenSchema): Promise<UserInfo> {
    const user = await this.prismaService.user.findUnique({
      where: {
        studentId: data.studentId,
      },
    });
    console.log(user);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}