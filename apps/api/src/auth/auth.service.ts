import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ProviderStatus, UserRole } from '@prisma/client';
import { createHash, timingSafeEqual } from 'crypto';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './types/jwt-payload.interface';

const ACCESS_TOKEN_TTL = 15 * 60; // 15 min [s]
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 dni [s]

type UserWithProvider = {
  id: string;
  phone: string;
  role: UserRole;
  providerId?: string;
  status?: ProviderStatus;
};

type SessionMeta = {
  userAgent?: string;
  ipAddress?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Użytkownicy ────────────────────────────────────────────────────────────

  /** Szuka lub tworzy użytkownika po numerze telefonu. Używane przy verify-otp. */
  async findOrCreateUser(phone: string): Promise<UserWithProvider> {
    let user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, role: UserRole.CLIENT },
      });
    }

    this.assertUserActive(user);
    return this.buildUserWithProvider(user);
  }

  /** Szuka istniejącego użytkownika — nigdy nie tworzy. Używane przy refresh. */
  async findUser(phone: string): Promise<UserWithProvider> {
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedException('Użytkownik nie istnieje.');
    this.assertUserActive(user);
    return this.buildUserWithProvider(user);
  }

  // ── Tokeny ─────────────────────────────────────────────────────────────────

  /**
   * Generuje parę access + refresh token. Oba tokeny zawierają ten sam jti
   * (= ID sesji), co umożliwia śledzenie i unieważnianie sesji.
   */
  issueTokens(payload: JwtPayload, jti: string): { accessToken: string; refreshToken: string } {
    const withJti = { ...payload, jti };

    const accessToken = this.jwt.sign(withJti, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwt.sign(withJti, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: REFRESH_TOKEN_TTL,
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): JwtPayload & { jti: string } {
    try {
      return this.jwt.verify<JwtPayload & { jti: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły refresh token.');
    }
  }

  // ── Sesje ──────────────────────────────────────────────────────────────────

  /**
   * Tworzy nową sesję. id sesji = jti (UUID pre-wygenerowany przez kontroler),
   * przechowujemy SHA-256 refresh tokenu — nigdy plaintext.
   */
  async createSession(
    userId: string,
    jti: string,
    refreshToken: string,
    meta?: SessionMeta,
  ): Promise<void> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
    await this.prisma.session.create({
      data: { id: jti, userId, tokenHash, expiresAt, ...meta },
    });
  }

  /**
   * Rotacja sesji: unieważnia starą, tworzy nową w jednej transakcji.
   * Wykrywa ponowne użycie tokenu (token reuse): jeśli sesja już odwołana →
   * unieważnia WSZYSTKIE aktywne sesje użytkownika (zakładamy kradzież tokenu).
   */
  async rotateSession(
    jti: string,
    userId: string,
    incomingToken: string,
    newJti: string,
    newToken: string,
    meta?: SessionMeta,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await tx.session.findUnique({ where: { id: jti } });

      if (!session || session.userId !== userId) {
        throw new UnauthorizedException('Sesja nie istnieje.');
      }

      if (session.expiresAt < new Date()) {
        throw new UnauthorizedException('Sesja wygasła.');
      }

      if (session.revokedAt) {
        // Token reuse detected — nuclear option: revoke all active sessions for this user.
        // Zakładamy kradzież tokenu — zmuszamy wszystkie urządzenia do re-login.
        await tx.session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException(
          'Wykryto ponowne użycie tokenu. Wszystkie sesje zostały unieważnione.',
        );
      }

      // timingSafeEqual zapobiega timing attack przy porównaniu hashów
      const incomingHash = createHash('sha256').update(incomingToken).digest('hex');
      const hashesMatch = timingSafeEqual(
        Buffer.from(incomingHash, 'hex'),
        Buffer.from(session.tokenHash, 'hex'),
      );
      if (!hashesMatch) {
        await tx.session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Wykryto podejrzaną aktywność. Zaloguj się ponownie.');
      }

      const newHash = createHash('sha256').update(newToken).digest('hex');
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
      const now = new Date();

      // Atomic: revoke old session and create new one.
      // Warunek revokedAt: null w updateMany gwarantuje że race condition (dwa równoległe
      // refresh z tym samym tokenem) wykryje się przy następnym żądaniu jako token reuse.
      await tx.session.update({
        where: { id: jti },
        data: { revokedAt: now, lastUsedAt: now },
      });
      await tx.session.create({
        data: { id: newJti, userId, tokenHash: newHash, expiresAt, lastUsedAt: now, ...meta },
      });
    });
  }

  /** Unieważnia konkretną sesję (logout z jednego urządzenia). */
  async revokeSession(jti: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Cookies ────────────────────────────────────────────────────────────────

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      // W prod: .opony.app pokrywa wszystkie subdomeny (same-site w sensie eTLD+1)
      domain: isProd ? '.opony.app' : undefined,
    };

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: ACCESS_TOKEN_TTL * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_TTL * 1000,
      path: '/v1/auth/refresh', // ogranicza wysyłanie cookie tylko do tego endpointu
    });
  }

  clearAuthCookies(res: Response): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';
    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      domain: isProd ? '.opony.app' : undefined,
    };
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', { ...base, path: '/v1/auth/refresh' });
  }

  // ── Prywatne ──────────────────────────────────────────────────────────────

  private assertUserActive(user: { isBanned: boolean; deletedAt: Date | null }): void {
    if (user.deletedAt) throw new UnauthorizedException('Konto zostało usunięte.');
    if (user.isBanned) throw new UnauthorizedException('Konto zablokowane.');
  }

  private async buildUserWithProvider(user: {
    id: string;
    phone: string;
    role: UserRole;
  }): Promise<UserWithProvider> {
    const provider = await this.prisma.provider.findUnique({
      where: { ownerId: user.id },
      select: { id: true, status: true },
    });

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      ...(provider ? { providerId: provider.id, status: provider.status } : {}),
    };
  }
}
