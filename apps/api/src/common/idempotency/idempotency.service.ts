import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

const TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface StoredResponse {
  payloadHash: string;
  statusCode: number;
  response: unknown;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  static hashPayload(body: unknown): string {
    return createHash('sha256').update(JSON.stringify(body)).digest('hex');
  }

  async find(scopedKey: string): Promise<StoredResponse | null> {
    const record = await this.prisma.idempotencyKey.findUnique({
      where: { scopedKey },
    });
    if (!record) return null;
    if (record.expiresAt < new Date()) {
      // Expired — treat as not found (cleanup cron will remove it)
      return null;
    }
    return {
      payloadHash: record.payloadHash,
      statusCode: record.statusCode,
      response: record.response,
    };
  }

  async store(
    scopedKey: string,
    payloadHash: string,
    statusCode: number,
    response: unknown,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + TTL_MS);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = response as any;
    await this.prisma.idempotencyKey.upsert({
      where: { scopedKey },
      create: { scopedKey, payloadHash, statusCode, response: json, expiresAt },
      update: { payloadHash, statusCode, response: json, expiresAt },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async purgeExpired(): Promise<void> {
    await this.prisma.idempotencyKey.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }
}
