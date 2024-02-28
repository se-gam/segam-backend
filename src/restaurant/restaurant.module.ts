import { Module } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { RestaurantRepository } from './restaurant.repository';

@Module({
  providers: [RestaurantService, RestaurantRepository],
  controllers: [RestaurantController],
})
export class RestaurantModule {}
