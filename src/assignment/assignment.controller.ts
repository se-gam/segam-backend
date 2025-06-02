import { Body, Controller, Delete, Param, Post, Put, UseGuards, Version } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { CreateUpdateAssignmentPayload } from "./payload/create-update-assignment.payload";
import { CurrentUser } from "src/auth/decorator/user.decorator";
import { UserInfo } from "src/auth/types/user-info.type";
import { AssignmentService } from "./assignment.service";

@ApiTags("과제 API")
@Controller('assignment')
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
  ) {}
  
  @Version('1')
  @ApiOperation({
    summary: '과제 생성 API',
    description: '과제를 생성합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createAssignment(@CurrentUser() user: UserInfo, @Body() payload: CreateUpdateAssignmentPayload): Promise<void> {
    console.log(payload)
    return await this.assignmentService.createAssignment(user, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '과제 수정 API',
    description: '과제를 수정합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateAssignment(
    @CurrentUser() user: UserInfo,
    @Param('id') id: string,
    @Body() payload: CreateUpdateAssignmentPayload,
  ): Promise<void> {
    return await this.assignmentService.updateAssignment(user, id, payload);
  }

  @Version('1')
  @ApiOperation({
    summary: '과제 삭제 API',
    description: '과제를 삭제합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAssignment(
    @CurrentUser() user: UserInfo,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.assignmentService.deleteAssignment(user, id);
  }
}