import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserInfo } from 'src/auth/types/user-info.type';
import { UserPayload } from './payload/user.payload';
import { UserService } from './user.service';

@ApiTags('유저 API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Version('1')
  @Post('friend')
  @ApiOperation({
    summary: '친구 추가',
    description: '학번에 해당하는 유저를 친구를 추가합니다.',
  })
  @ApiCreatedResponse({
    description: '친구 추가 성공',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 사용자입니다.',
  })
  @ApiBadRequestResponse({
    description:
      '이미 친구로 등록된 사용자입니다. | 자기 자신을 친구로 등록할 수 없습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addUserAsFriend(
    @CurrentUser() user: UserInfo,
    @Body() payload: UserPayload,
  ): Promise<void> {
    await this.userService.addUserAsFriend(payload, user);
  }

  @Version('1')
  @HttpCode(204)
  @Delete('friend/:studentId')
  @ApiOperation({
    summary: '친구 삭제',
    description: '학번에 해당하는 유저를 친구를 삭제합니다.',
  })
  @ApiNoContentResponse({
    description: '친구 삭제 성공',
  })
  @ApiNotFoundResponse({
    description: '존재하지 않는 사용자입니다.',
  })
  @ApiBadRequestResponse({
    description:
      '친구로 등록되지 않은 사용자입니다. | 자기 자신을 친구에서 삭제할 수 없습니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteFriend(
    @Param('studentId') friendId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    await this.userService.deleteFriend(friendId, user);
  }
}
