import { Injectable } from '@nestjs/common';
import { NotificationPreferencesDto } from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationPreferencesRepository } from './notification-preferences.repository';

@Injectable()
export class NotificationPreferencesService {
  constructor(private readonly repo: NotificationPreferencesRepository) {}

  async get(providerId: string): Promise<NotificationPreferencesDto> {
    const prefs = await this.repo.getOrCreate(providerId);
    return this.toDto(prefs);
  }

  async update(
    providerId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const prefs = await this.repo.upsert(providerId, dto);
    return this.toDto(prefs);
  }

  private toDto(p: {
    newBookingSms: boolean;
    newBookingEmail: boolean;
    newBookingPush: boolean;
    cancelationSms: boolean;
    cancelationEmail: boolean;
    cancelationPush: boolean;
    reminder30Sms: boolean;
    reminder30Email: boolean;
    reminder30Push: boolean;
    newReviewSms: boolean;
    newReviewEmail: boolean;
    newReviewPush: boolean;
    weeklyReportSms: boolean;
    weeklyReportEmail: boolean;
    weeklyReportPush: boolean;
    platformNewsSms: boolean;
    platformNewsEmail: boolean;
    platformNewsPush: boolean;
  }): NotificationPreferencesDto {
    return {
      newBookingSms: p.newBookingSms,
      newBookingEmail: p.newBookingEmail,
      newBookingPush: p.newBookingPush,
      cancelationSms: p.cancelationSms,
      cancelationEmail: p.cancelationEmail,
      cancelationPush: p.cancelationPush,
      reminder30Sms: p.reminder30Sms,
      reminder30Email: p.reminder30Email,
      reminder30Push: p.reminder30Push,
      newReviewSms: p.newReviewSms,
      newReviewEmail: p.newReviewEmail,
      newReviewPush: p.newReviewPush,
      weeklyReportSms: p.weeklyReportSms,
      weeklyReportEmail: p.weeklyReportEmail,
      weeklyReportPush: p.weeklyReportPush,
      platformNewsSms: p.platformNewsSms,
      platformNewsEmail: p.platformNewsEmail,
      platformNewsPush: p.platformNewsPush,
    };
  }
}
