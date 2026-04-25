import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const OTP_TTL_SECONDS = 5 * 60; // 5 minut
const OTP_RATE_LIMIT_WINDOW = 15 * 60; // 15 minut
const OTP_RATE_LIMIT_MAX = 3;
const OTP_MAX_ATTEMPTS = 3;
const BCRYPT_ROUNDS = 10;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(phone: string): Promise<void> {
    await this.checkRateLimit(phone);

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

    await this.prisma.otpToken.create({
      data: { phone, codeHash, expiresAt },
    });

    const isMock = this.config.get<string>('TWILIO_MOCK') === 'true';
    if (isMock) {
      // W trybie dev kod wyświetlany w konsoli — nigdy w prod
      this.logger.warn(`[OTP MOCK] phone=${phone} code=${code}`);
    } else {
      await this.sendSms(phone, code);
    }
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    // Transakcja zapewnia atomowość odczytu i inkrementacji prób
    return this.prisma.$transaction(async (tx) => {
      const token = await tx.otpToken.findFirst({
        where: {
          phone,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { expiresAt: 'desc' },
      });

      if (!token) return false;
      if (token.attempts >= OTP_MAX_ATTEMPTS) return false;

      const isValid = await bcrypt.compare(code, token.codeHash);

      if (!isValid) {
        await tx.otpToken.update({
          where: { id: token.id },
          data: { attempts: { increment: 1 } },
        });
        return false;
      }

      await tx.otpToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      });

      return true;
    });
  }

  private async checkRateLimit(phone: string): Promise<void> {
    // Liczymy po createdAt (nie expiresAt) — poprawne 15-minutowe okno
    const windowStart = new Date(Date.now() - OTP_RATE_LIMIT_WINDOW * 1000);
    const count = await this.prisma.otpToken.count({
      where: {
        phone,
        createdAt: { gt: windowStart },
      },
    });

    if (count >= OTP_RATE_LIMIT_MAX) {
      throw new HttpException(
        'Zbyt wiele prób. Spróbuj ponownie za 15 minut.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  // CSPRNG — kryptograficznie bezpieczny generator losowy
  private generateCode(): string {
    return randomInt(100_000, 1_000_000).toString();
  }

  private async sendSms(phone: string, code: string): Promise<void> {
    // TODO Sprint 2: integracja Twilio
    // const client = twilio(this.config.get('TWILIO_SID'), this.config.get('TWILIO_AUTH_TOKEN'));
    // await client.messages.create({
    //   to: phone,
    //   from: this.config.get('TWILIO_PHONE'),
    //   body: `Twój kod weryfikacyjny opony.app: ${code}. Ważny 5 minut.`,
    // });
    this.logger.warn(`sendSms() wywołany dla ${phone} — produkcja wymaga Twilio`);
  }
}
