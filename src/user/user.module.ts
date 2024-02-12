import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [UserRepository],
})
export class UserModule {}
