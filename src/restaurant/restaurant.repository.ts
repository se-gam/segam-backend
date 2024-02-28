import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { RestaurantListDto } from './dto/restaurant.dto';
import { Restaurant } from './types/restaurant.type';

@Injectable()
export class RestaurantRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getRestaurants(): Promise<Restaurant[]> {
    return await this.prismaService.restaurant.findMany();
  }
}
