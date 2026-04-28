import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async createAndSend(providerId: string, email: string): Promise<void> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h

    await this.prisma.emailVerificationToken.create({
      data: { providerId, email, tokenHash, expiresAt },
    });

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
