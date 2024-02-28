import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '../types/restaurant.type';

export class RestaurantDto {
  @ApiProperty({
    description: '식당 이름',
    type: String,
  })
  name!: string;

  static from(restaurant: Restaurant): RestaurantDto {
    return {
      name: restaurant.name,
    };
  }
}

export class RestaurantListDto {
  @ApiProperty({
    description: '식당 목록',
    type: [RestaurantDto],
  })
  restaurants!: RestaurantDto[];

  static from(restaurants: Restaurant[]): RestaurantListDto {
    return {
      restaurants: restaurants.map((restaurant) => {
        return RestaurantDto.from(restaurant);
      }),
    };
  }
}
