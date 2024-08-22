import { Module } from '@nestjs/common';
import { GodokService } from './godok.service';
import { GodokController } from './godok.controller';
import { GodokRepository } from './godok.repository';

@Module({
  providers: [GodokService, GodokRepository],
  controllers: [GodokController],
})
export class GodokModule {}
