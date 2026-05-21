import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailType } from '@prisma/client';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import {
  accountApprovedTemplate,
  accountRejectedTemplate,
  emailChangeOtpTemplate,
  emailVerificationTemplate,
  submissionReceivedTemplate,
} from './templates/email.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY', '');
    if (apiKey && apiKey !== 'placeholder') {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      this.logger.warn('RESEND_API_KEY not configured — email sending disabled');
    }
    this.fromEmail = this.config.get<string>('RESEND_FROM_EMAIL', 'noreply@opony.app');
  }

  async sendEmailChangeOtp(providerId: string, to: string, code: string): Promise<void> {
    const html = emailChangeOtpTemplate(code, to);
    await this.sendAndLog(
      providerId,
      EmailType.EMAIL_CHANGE_OTP,
      to,
      `${code} — kod zmiany adresu email · Opony.app`,
      html,
    );
  }

  async sendEmailVerification(providerId: string, to: string, rawToken: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:4000');
    const link = `${appUrl}/v1/auth/verify-email?token=${rawToken}`;
    const html = emailVerificationTemplate(link);
    await this.sendAndLog(
      providerId,
      EmailType.EMAIL_VERIFICATION,
      to,
      'Potwierdź adres email — Opony.app',
      html,
    );
  }

  async sendSubmissionReceived(
    providerId: string,
    to: string,
    providerName: string,
  ): Promise<void> {
    const html = submissionReceivedTemplate(providerName);
    await this.sendAndLog(
      providerId,
      EmailType.SUBMISSION_RECEIVED,
      to,
      'Zgłoszenie przyjęte — Opony.app',
      html,
    );
  }

  async sendAccountApproved(providerId: string, to: string, providerName: string): Promise<void> {
    const html = accountApprovedTemplate(providerName);
    await this.sendAndLog(
      providerId,
      EmailType.ACCOUNT_APPROVED,
      to,
      'Konto zatwierdzone — Opony.app',
      html,
    );
  }

  async sendAccountRejected(
    providerId: string,
    to: string,
    providerName: string,
    reason?: string,
  ): Promise<void> {
    const html = accountRejectedTemplate(providerName, reason);
    await this.sendAndLog(
      providerId,
      EmailType.ACCOUNT_REJECTED,
      to,
      'Informacja o zgłoszeniu — Opony.app',
      html,
    );
  }

  // ── Prywatne ─────────────────────────────────────────────────────────────

  private async sendAndLog(
    providerId: string,
    type: EmailType,
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    let error: string | null = null;

    if (!this.resend) {
      this.logger.warn(`Email sending skipped [${type}] to ${to} — Resend not configured`);
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (result.error) {
        error = result.error.message ?? 'Nieznany błąd Resend';
        this.logger.error(`Resend error [${type}] to ${to}: ${error}`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to send email [${type}] to ${to}: ${error}`);
    }

    try {
      await this.prisma.emailLog.create({
        data: { providerId, type, to, error },
      });
    } catch (logErr) {
      this.logger.error(`Failed to write EmailLog: ${String(logErr)}`);
    }
  }
}
