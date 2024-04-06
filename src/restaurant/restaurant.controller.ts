import { Controller, Get, Version } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantListDto } from './dto/restaurant.dto';

@ApiTags('식당 API')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Version('1')
  @ApiOkResponse({ type: RestaurantListDto })
  @ApiOperation({
    summary: '식당 목록 조회 API',
    description: '식당의 이름 목록을 조회합니다.',
  })
  @Get()
  async getRestaurants(): Promise<RestaurantListDto> {
    return this.restaurantService.getRestaurants();
  }
}
