import { Module } from '@nestjs/common';
import { PushSubscriptionsModule } from '../push-subscriptions/push-subscriptions.module';
import { EmailChannelService } from './channels/email-channel.service';
import { PushChannelService } from './channels/push-channel.service';
import { SmsChannelService } from './channels/sms-channel.service';
import { NotificationDispatcherService } from './notification-dispatcher.service';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferencesRepository } from './notification-preferences.repository';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationSchedulerService } from './notification-scheduler.service';

@Module({
  imports: [PushSubscriptionsModule],
  controllers: [NotificationPreferencesController],
  providers: [
    NotificationPreferencesService,
    NotificationPreferencesRepository,
    NotificationDispatcherService,
    NotificationSchedulerService,
    SmsChannelService,
    EmailChannelService,
    PushChannelService,
  ],
})
export class NotificationPreferencesModule {}
