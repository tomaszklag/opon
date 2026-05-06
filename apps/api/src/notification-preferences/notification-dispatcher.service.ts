import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationPreferences } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingCreatedEvent, BookingStatusChangedEvent } from '../realtime/events/booking.events';
import { ReviewCreatedEvent } from '../realtime/events/review.events';
import { EmailChannelService } from './channels/email-channel.service';
import { PushChannelService } from './channels/push-channel.service';
import { SmsChannelService } from './channels/sms-channel.service';
import { NotificationPreferencesRepository } from './notification-preferences.repository';
import {
  cancelationEmail,
  cancelationSms,
  newBookingEmail,
  newBookingSms,
  newReviewEmail,
  newReviewSms,
} from './templates/notification-templates';

const CANCELATION_STATUSES: Record<string, 'CLIENT' | 'PROVIDER' | 'SYSTEM'> = {
  CANCELLED_BY_CLIENT: 'CLIENT',
  CANCELLED_BY_PROVIDER: 'PROVIDER',
  CANCELLED_BY_SYSTEM: 'SYSTEM',
};

type ProviderContact = { name: string; phone: string | null; email: string | null };

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    private readonly repo: NotificationPreferencesRepository,
    private readonly prisma: PrismaService,
    private readonly sms: SmsChannelService,
    private readonly emailChannel: EmailChannelService,
    private readonly push: PushChannelService,
  ) {}

  // ── Handlers ───────────────────────────────────────────────────────────────

  @OnEvent(BookingCreatedEvent.EVENT)
  async onBookingCreated(event: BookingCreatedEvent): Promise<void> {
    const [prefs, provider] = await this.load(event.providerId);
    if (!prefs || !provider) return;

    const ctx = { referenceCode: event.referenceCode, providerName: provider.name };
    if (prefs.newBookingSms && provider.phone) this.sms.send(provider.phone, newBookingSms(ctx));
    if (prefs.newBookingEmail && provider.email)
      this.emailChannel.send(provider.email, newBookingEmail(ctx));
    if (prefs.newBookingPush)
      void this.push.send(event.providerId, 'Nowa rezerwacja', `#${event.referenceCode}`);
  }

  @OnEvent(BookingStatusChangedEvent.EVENT)
  async onBookingStatusChanged(event: BookingStatusChangedEvent): Promise<void> {
    const cancelledBy = CANCELATION_STATUSES[event.newStatus];
    if (!cancelledBy) return;

    const [prefs, provider] = await this.load(event.providerId);
    if (!prefs || !provider) return;

    const ctx = { referenceCode: event.referenceCode, cancelledBy };
    if (prefs.cancelationSms && provider.phone) this.sms.send(provider.phone, cancelationSms(ctx));
    if (prefs.cancelationEmail && provider.email)
      this.emailChannel.send(provider.email, cancelationEmail(ctx));
    if (prefs.cancelationPush)
      void this.push.send(event.providerId, 'Anulowanie rezerwacji', `#${event.referenceCode}`);
  }

  // Gotowy handler — wyzwoli się gdy zostanie dodany endpoint tworzenia opinii przez klienta
  @OnEvent(ReviewCreatedEvent.EVENT)
  async onReviewCreated(event: ReviewCreatedEvent): Promise<void> {
    const [prefs, provider] = await this.load(event.providerId);
    if (!prefs || !provider) return;

    const ctx = { referenceCode: event.bookingReferenceCode, rating: event.rating };
    if (prefs.newReviewSms && provider.phone) this.sms.send(provider.phone, newReviewSms(ctx));
    if (prefs.newReviewEmail && provider.email)
      this.emailChannel.send(provider.email, newReviewEmail(ctx));
    if (prefs.newReviewPush)
      void this.push.send(
        event.providerId,
        'Nowa opinia',
        `${event.rating}/5 · #${event.bookingReferenceCode}`,
      );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async load(
    providerId: string,
  ): Promise<[NotificationPreferences | null, ProviderContact | null]> {
    try {
      const [prefs, provider] = await Promise.all([
        this.repo.getOrCreate(providerId),
        this.prisma.provider.findUnique({
          where: { id: providerId },
          select: { name: true, phone: true, email: true },
        }),
      ]);
      return [prefs, provider];
    } catch (err) {
      this.logger.error(`Błąd ładowania danych dla provider=${providerId}`, err);
      return [null, null];
    }
  }
}
