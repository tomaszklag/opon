import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsChannelService {
  private readonly logger = new Logger('SmsChannel');

  send(phone: string, message: string): void {
    this.logger.log(`TO: ${phone}`);
    this.logger.log(`MSG: ${message}`);
    // TODO: SmsApiAdapter.send(phone, message)
  }
}
