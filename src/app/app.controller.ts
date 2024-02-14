import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
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
  getHelloPrivate(): string {
    return this.appService.getHello();
  }
}
