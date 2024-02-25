import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/auth/types/user-info.type';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health Check' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('private')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Private Health Check' })
  @ApiBearerAuth()
  async getHelloPrivate(@CurrentUser() user: UserInfo): Promise<UserInfo> {
    return user;
  }
}
