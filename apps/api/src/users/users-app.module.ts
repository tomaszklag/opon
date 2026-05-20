import { Module } from '@nestjs/common';
import { UsersAppController } from './users-app.controller';

@Module({
  controllers: [UsersAppController],
  providers: [],
})
export class UsersAppModule {}
