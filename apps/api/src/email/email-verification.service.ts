import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  async createAndSend(providerId: string, email: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h

    await this.prisma.emailVerificationToken.create({
      data: { providerId, email, tokenHash, expiresAt },
    });

    if (this.config.get('NODE_ENV') === 'development') {
      const appUrl = this.config.get('APP_URL', 'http://localhost:4000');
      this.logger.debug(
        `[DEV] Email verification link for ${email}:\n  ${appUrl}/v1/auth/verify-email?token=${rawToken}`,
      );
    }

    await this.emailService.sendEmailVerification(providerId, email, rawToken);
  }

  async verifyToken(rawToken: string): Promise<{ providerId: string } | null> {
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!token || token.usedAt !== null || token.expiresAt <= new Date()) {
      return null;
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.provider.update({
        where: { id: token.providerId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    return { providerId: token.providerId };
  }
}
