import { Injectable, Logger } from '@nestjs/common';
import { EmailContent } from '../templates/notification-templates';

@Injectable()
export class EmailChannelService {
  private readonly logger = new Logger('EmailChannel');

  send(to: string, content: EmailContent): void {
    this.logger.log(`TO: ${to}`);
    this.logger.log(`SUBJECT: ${content.subject}`);
    this.logger.log(`TEXT: ${content.text}`);
    // TODO: Resend.send({ to, subject: content.subject, html: content.html })
  }
}
