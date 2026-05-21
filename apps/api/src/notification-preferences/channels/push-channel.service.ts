import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PushSubscriptionsRepository } from '../../push-subscriptions/push-subscriptions.repository';

@Injectable()
export class PushChannelService {
  private readonly logger = new Logger('PushChannel');
  private readonly ready: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly subscriptions: PushSubscriptionsRepository,
  ) {
    const publicKey = config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY');
    const subject = config.get<string>('VAPID_SUBJECT', 'mailto:kontakt@opony.app');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.ready = true;
    } else {
      this.logger.warn('VAPID keys not configured — push notifications disabled');
      this.ready = false;
    }
  }

  async send(providerId: string, title: string, body: string): Promise<void> {
    if (!this.ready) {
      this.logger.log(`[Push] provider=${providerId} | ${title}: ${body} (VAPID not configured)`);
      return;
    }

    const subs = await this.subscriptions.findByProvider(providerId);
    if (!subs.length) return;

    const payload = JSON.stringify({ title, body, icon: '/icons/icon-192.png' });

    await Promise.allSettled(
      subs.map((sub) =>
        webpush
          .sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
          )
          .then(() => this.logger.log(`[Push] sent → ${sub.endpoint.slice(0, 60)}…`))
          .catch((err: unknown) => {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 410 || status === 404) {
              return this.subscriptions.deleteByEndpoint(providerId, sub.endpoint);
            }
            this.logger.error(`[Push] failed → ${String(err)}`);
            return undefined;
          }),
      ),
    );
  }
}
