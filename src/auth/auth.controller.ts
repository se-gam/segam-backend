import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { RefreshTokenPayload } from './payload/refresh-token.payload';
import { SignUpPayload } from './payload/signup.payload';
import { SignUpValidationPipe } from './pipes/password-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Version('1')
  @Post('signup')
  @ApiOperation({
    summary: '회원가입 및 로그인 API',
    description:
      '학번과 비밀번호를 입력해서 포탈에 검증한 뒤 JWT를 발급합니다.',
  })
  @ApiCreatedResponse({ type: TokenDto })
  async signup(
    @Body(SignUpValidationPipe) payload: SignUpPayload,
  ): Promise<TokenDto> {
    return this.authService.signup(payload);
  }

  @Version('1')
  @Post('refresh')
  @ApiOperation({
    summary: '토큰 갱신 API',
    description: '기존 토큰을 갱신합니다.',
  })
  @ApiCreatedResponse({ type: TokenDto })
  async refresh(@Body() payload: RefreshTokenPayload): Promise<TokenDto> {
    return this.authService.refresh(payload.refreshToken);
  }
}
