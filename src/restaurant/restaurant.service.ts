import { Injectable } from '@nestjs/common';
import { RestaurantRepository } from './restaurant.repository';
import { RestaurantListDto } from './dto/restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private readonly restaurantRepository: RestaurantRepository) {}

  async getRestaurants(): Promise<RestaurantListDto> {
    const restaurants = await this.restaurantRepository.getRestaurants();
    return RestaurantListDto.from(restaurants);
  }
}
