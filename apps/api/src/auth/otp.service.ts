import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { AppException, ErrorCode } from '../common/errors';
import { OtpRepository } from './otp.repository';

const OTP_TTL_SECONDS = 5 * 60; // 5 minut
const OTP_RATE_LIMIT_WINDOW = 15 * 60; // 15 minut
const OTP_RATE_LIMIT_MAX = 3;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(phone: string): Promise<{ alreadySent: boolean; expiresIn: number }> {
    const existing = await this.otpRepository.findActiveToken(phone);
    this.logger.warn(
      `[OTP] findActiveToken(${phone}) → ${existing ? `found, expiresAt=${existing.expiresAt.toISOString()}` : 'null'}`,
    );
    if (existing) {
      const secondsLeft = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
      this.logger.warn(`[OTP] alreadySent=true, secondsLeft=${secondsLeft}`);
      return { alreadySent: true, expiresIn: secondsLeft };
    }

    await this.checkRateLimit(phone);

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await this.otpRepository.createToken(phone, codeHash, expiresAt);

    const isMock = this.config.get<string>('TWILIO_MOCK') === 'true';
    if (isMock) {
      this.logger.warn(`[OTP MOCK] phone=${phone} code=${code}`);
    } else {
      await this.sendSms(phone, code);
    }

    return { alreadySent: false, expiresIn: OTP_TTL_SECONDS };
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    return this.otpRepository.verifyAndConsume(phone, code);
  }

  private async checkRateLimit(phone: string): Promise<void> {
    const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW * 1000);
    const count = await this.otpRepository.countRecent(phone, windowStart);

    if (count >= OTP_RATE_LIMIT_MAX) {
      throw new AppException(
        ErrorCode.OTP_RATE_LIMIT_EXCEEDED,
        'Zbyt wiele prób. Spróbuj ponownie za 15 minut.',
        429,
      );
    }
  }

  private generateCode(): string {
    return randomInt(100_000, 1_000_000).toString();
  }

  private async sendSms(phone: string, code: string): Promise<void> {
    // TODO Sprint 2: integracja Twilio
    this.logger.warn(`sendSms() wywołany dla ${phone} — produkcja wymaga Twilio`);
  }
}
