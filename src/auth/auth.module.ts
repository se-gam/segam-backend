import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceRepository } from 'src/attendance/attendance.repository';
import { EcampusService } from 'src/attendance/ecampus.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtStrategy } from './guard/jwt.strategy';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME')}`,
        },
      }),
    }),
  ],
  exports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    ConfigService,
    JwtStrategy,
    AuthRepository,
    EcampusService,
    AttendanceRepository,
  ],
})
export class AuthModule {}
