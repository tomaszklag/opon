import { Module } from '@nestjs/common';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscriptionsRepository } from './push-subscriptions.repository';

@Module({
  controllers: [PushSubscriptionsController],
  providers: [PushSubscriptionsRepository],
  exports: [PushSubscriptionsRepository],
})
export class PushSubscriptionsModule {}
