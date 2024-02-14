import { Body, Controller, Post, Version } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { SignUpPayload } from './payload/signup.payload';

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
  async signup(@Body() payload: SignUpPayload): Promise<TokenDto> {
    return this.authService.signup(payload);
  }
}
