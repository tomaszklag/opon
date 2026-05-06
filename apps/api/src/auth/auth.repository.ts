import { Injectable } from '@nestjs/common';
import { ProviderStatus, UserRole } from '@prisma/client';
import { createHash, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 dni [s]

export type UserRow = {
  id: string;
  phone: string;
  role: UserRole;
  isBanned: boolean;
  deletedAt: Date | null;
};

export type ProviderRef = {
  id: string;
  status: ProviderStatus;
};

type CreateSessionData = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
};

type RotateParams = {
  jti: string;
  userId: string;
  incomingToken: string;
  newJti: string;
  newToken: string;
  userAgent?: string;
  ipAddress?: string;
};

export type RotateSessionResult =
  | { ok: true }
  | { ok: false; reason: 'NOT_FOUND' | 'EXPIRED' | 'REUSED' | 'HASH_MISMATCH' };

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByPhone(phone: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: { id: true, phone: true, role: true, isBanned: true, deletedAt: true },
    });
  }

  createUser(phone: string): Promise<UserRow> {
    return this.prisma.user.create({
      data: { phone, role: UserRole.CLIENT },
      select: { id: true, phone: true, role: true, isBanned: true, deletedAt: true },
    });
  }

  findProviderByOwnerId(ownerId: string): Promise<ProviderRef | null> {
    return this.prisma.provider.findUnique({
      where: { ownerId },
      select: { id: true, status: true },
    });
  }

  async createSession(data: CreateSessionData): Promise<void> {
    await this.prisma.session.create({ data });
  }

  async revokeSession(jti: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // Zwraca wszystkie sesje (aktywne + wygasłe + odwołane) — UI wyświetla pełną historię
  listUserSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  async revokeSessionById(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.session.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count > 0;
  }

  async revokeOtherSessions(userId: string, currentJti: string): Promise<number> {
    const result = await this.prisma.session.updateMany({
      where: { userId, id: { not: currentJti }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return result.count;
  }

  /**
   * Rotacja sesji w jednej transakcji. Zwraca RotateSessionResult zamiast
   * rzucać wyjątkiem — serwis mapuje reason → UnauthorizedException.
   * Token reuse → nuclear option: odwołuje wszystkie aktywne sesje użytkownika.
   */
  async rotateSession(params: RotateParams): Promise<RotateSessionResult> {
    return this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({ where: { id: params.jti } });

      if (!session || session.userId !== params.userId) {
        return { ok: false, reason: 'NOT_FOUND' } as const;
      }
      if (session.expiresAt < new Date()) {
        return { ok: false, reason: 'EXPIRED' } as const;
      }
      if (session.revokedAt) {
        await tx.session.updateMany({
          where: { userId: params.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return { ok: false, reason: 'REUSED' } as const;
      }

      // timingSafeEqual zapobiega timing attack przy porównaniu hashów
      const incomingHash = createHash('sha256').update(params.incomingToken).digest('hex');
      const hashesMatch = timingSafeEqual(
        Buffer.from(incomingHash, 'hex'),
        Buffer.from(session.tokenHash, 'hex'),
      );
      if (!hashesMatch) {
        await tx.session.updateMany({
          where: { userId: params.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return { ok: false, reason: 'HASH_MISMATCH' } as const;
      }

      const newHash = createHash('sha256').update(params.newToken).digest('hex');
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
      const now = new Date();

      await tx.session.update({
        where: { id: params.jti },
        data: { revokedAt: now, lastUsedAt: now },
      });
      await tx.session.create({
        data: {
          id: params.newJti,
          userId: params.userId,
          tokenHash: newHash,
          expiresAt,
          lastUsedAt: now,
          userAgent: params.userAgent,
          ipAddress: params.ipAddress,
        },
      });

      return { ok: true } as const;
    });
  }
}
