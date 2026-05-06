import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailChannelService } from './channels/email-channel.service';
import { PushChannelService } from './channels/push-channel.service';
import { SmsChannelService } from './channels/sms-channel.service';
import { NotificationPreferencesRepository } from './notification-preferences.repository';
import { reminderSms, reminderEmail } from './templates/notification-templates';

const REMINDER_STATUSES: BookingStatus[] = ['CONFIRMED', 'PENDING'];

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: NotificationPreferencesRepository,
    private readonly sms: SmsChannelService,
    private readonly emailChannel: EmailChannelService,
    private readonly push: PushChannelService,
  ) {}

  // Co 5 minut — wysyła przypomnienia dla rezerwacji zaczynających się za 25–35 min
  @Cron('*/5 * * * *')
  async sendReminders(): Promise<void> {
    const now = new Date();
    const from = new Date(now.getTime() + 25 * 60 * 1000);
    const to = new Date(now.getTime() + 35 * 60 * 1000);

    const bookings = await this.prisma.booking.findMany({
      where: {
        startAt: { gte: from, lte: to },
        status: { in: REMINDER_STATUSES },
        reminderSentAt: null,
      },
      select: { id: true, providerId: true, referenceCode: true, startAt: true },
    });

    if (!bookings.length) return;
    this.logger.log(`Sending reminders for ${bookings.length} booking(s)`);

    for (const booking of bookings) {
      try {
        // Claim before sending — prevents duplicate sends if two instances race
        const claimed = await this.prisma.booking.updateMany({
          where: { id: booking.id, reminderSentAt: null },
          data: { reminderSentAt: new Date() },
        });
        if (claimed.count === 0) continue;
        await this.sendReminderFor(booking.providerId, booking.referenceCode, booking.startAt);
      } catch (err) {
        this.logger.error(`Reminder failed for booking ${booking.referenceCode}`, err);
      }
    }
  }

  private async sendReminderFor(
    providerId: string,
    referenceCode: string,
    startAt: Date,
  ): Promise<void> {
    const [prefs, provider] = await Promise.all([
      this.repo.getOrCreate(providerId),
      this.prisma.provider.findUnique({
        where: { id: providerId },
        select: { phone: true, email: true, name: true },
      }),
    ]);
    if (!prefs || !provider) return;

    const ctx = {
      referenceCode,
      startAt: startAt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
    };
    if (prefs.reminder30Sms && provider.phone) this.sms.send(provider.phone, reminderSms(ctx));
    if (prefs.reminder30Email && provider.email)
      this.emailChannel.send(provider.email, reminderEmail(ctx));
    if (prefs.reminder30Push)
      void this.push.send(
        providerId,
        'Przypomnienie',
        `Rezerwacja #${referenceCode} za ok. 30 min`,
      );
  }
}
