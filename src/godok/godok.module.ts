import { Module } from '@nestjs/common';
import { GodokController } from './godok.controller';
import { GodokService } from './godok.service';

@Module({
  providers: [GodokService],
  controllers: [GodokController],
})
export class GodokModule {}
