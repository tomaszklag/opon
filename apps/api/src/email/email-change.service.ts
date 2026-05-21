import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { AppException, ErrorCode } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

const OTP_TTL_SECONDS = 10 * 60; // 10 minut
const OTP_RATE_LIMIT_WINDOW = 15 * 60; // 15 minut
const OTP_RATE_LIMIT_MAX = 3;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class EmailChangeService {
  private readonly logger = new Logger(EmailChangeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(
    providerId: string,
    newEmail: string,
  ): Promise<{ alreadySent: boolean; expiresIn: number }> {
    // Zwróć istniejący aktywny token jeśli jest
    const existing = await this.prisma.emailChangeToken.findFirst({
      where: {
        providerId,
        newEmail,
        usedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: 3 },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (existing) {
      const secondsLeft = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
      return { alreadySent: true, expiresIn: secondsLeft };
    }

    // Rate limiting — max 3 żądań na 15 min per providerId
    const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW * 1000);
    const recentCount = await this.prisma.emailChangeToken.count({
      where: { providerId, createdAt: { gt: windowStart } },
    });
    if (recentCount >= OTP_RATE_LIMIT_MAX) {
      throw new AppException(
        ErrorCode.OTP_RATE_LIMIT_EXCEEDED,
        'Zbyt wiele prób. Spróbuj ponownie za 15 minut.',
        429,
      );
    }

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await this.prisma.emailChangeToken.create({
      data: { providerId, newEmail, codeHash, expiresAt },
    });

    if (this.config.get('NODE_ENV') === 'development') {
      this.logger.debug(`[EMAIL OTP] providerId=${providerId} email=${newEmail} code=${code}`);
    }

    await this.emailService.sendEmailChangeOtp(providerId, newEmail, code);

    return { alreadySent: false, expiresIn: OTP_TTL_SECONDS };
  }

  async confirmChange(providerId: string, newEmail: string, code: string): Promise<void> {
    const token = await this.prisma.emailChangeToken.findFirst({
      where: { providerId, newEmail, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { expiresAt: 'desc' },
    });

    if (!token || token.attempts >= 3) {
      throw new AppException(
        ErrorCode.EMAIL_CHANGE_OTP_INVALID,
        'Kod jest nieprawidłowy lub wygasł.',
        401,
      );
    }

    const isValid = await bcrypt.compare(code, token.codeHash);

    if (!isValid) {
      await this.prisma.emailChangeToken.update({
        where: { id: token.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppException(
        ErrorCode.EMAIL_CHANGE_OTP_INVALID,
        'Kod jest nieprawidłowy lub wygasł.',
        401,
      );
    }

    await this.prisma.$transaction([
      this.prisma.emailChangeToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.provider.update({
        where: { id: providerId },
        data: { email: newEmail, emailVerifiedAt: new Date() },
      }),
    ]);
  }

  private generateCode(): string {
    if (this.config.get('NODE_ENV') === 'development') return '000000';
    return randomInt(100_000, 1_000_000).toString();
  }
}
