import { Controller, Get, Version } from '@nestjs/common';
import { GodokService } from './godok.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('고전독서 API')
@Controller('godok')
export class GodokController {
  constructor(private readonly godokService: GodokService) {}
}
