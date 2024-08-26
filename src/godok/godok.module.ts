import { Module } from '@nestjs/common';
import { GodokService } from './godok.service';
import { GodokController } from './godok.controller';
import { GodokRepository } from './godok.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  providers: [GodokService, GodokRepository, UserRepository],
  controllers: [GodokController],
})
export class GodokModule {}
