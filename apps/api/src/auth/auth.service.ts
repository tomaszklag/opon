import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ProviderStatus, UserRole } from '@prisma/client';
import { createHash } from 'crypto';
import type { Response } from 'express';
import { AppException, ErrorCode } from '../common/errors';
import { AuthRepository } from './auth.repository';
import { SessionResponseDto } from './dto/session-response.dto';
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
    private readonly authRepository: AuthRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ── Użytkownicy ────────────────────────────────────────────────────────────

  /** Szuka lub tworzy użytkownika po numerze telefonu. Używane przy verify-otp. */
  async findOrCreateUser(phone: string): Promise<UserWithProvider> {
    let user = await this.authRepository.findUserByPhone(phone);
    if (!user) {
      user = await this.authRepository.createUser(phone);
    }
    this.assertUserActive(user);
    return this.buildUserWithProvider(user);
  }

  /** Szuka istniejącego użytkownika — nigdy nie tworzy. Używane przy refresh. */
  async findUser(phone: string): Promise<UserWithProvider> {
    const user = await this.authRepository.findUserByPhone(phone);
    if (!user)
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND, 'Użytkownik nie istnieje.', 401);
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
      throw new AppException(
        ErrorCode.AUTH_INVALID_REFRESH_TOKEN,
        'Nieprawidłowy lub wygasły refresh token.',
        401,
      );
    }
  }

  // ── Sesje ──────────────────────────────────────────────────────────────────

  async createSession(
    userId: string,
    jti: string,
    refreshToken: string,
    meta?: SessionMeta,
  ): Promise<void> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
    await this.authRepository.createSession({ id: jti, userId, tokenHash, expiresAt, ...meta });
  }

  async rotateSession(
    jti: string,
    userId: string,
    incomingToken: string,
    newJti: string,
    newToken: string,
    meta?: SessionMeta,
  ): Promise<void> {
    const result = await this.authRepository.rotateSession({
      jti,
      userId,
      incomingToken,
      newJti,
      newToken,
      ...meta,
    });

    if (!result.ok) {
      switch (result.reason) {
        case 'NOT_FOUND':
          throw new AppException(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Sesja nie istnieje.', 401);
        case 'EXPIRED':
          throw new AppException(ErrorCode.AUTH_SESSION_EXPIRED, 'Sesja wygasła.', 401);
        case 'REUSED':
          throw new AppException(
            ErrorCode.AUTH_TOKEN_REUSE_DETECTED,
            'Wykryto ponowne użycie tokenu. Wszystkie sesje zostały unieważnione.',
            401,
          );
        case 'HASH_MISMATCH':
          throw new AppException(
            ErrorCode.AUTH_SUSPICIOUS_ACTIVITY,
            'Wykryto podejrzaną aktywność. Zaloguj się ponownie.',
            401,
          );
      }
    }
  }

  async revokeSession(jti: string): Promise<void> {
    await this.authRepository.revokeSession(jti);
  }

  async listSessions(
    userId: string,
    currentJti: string | undefined,
  ): Promise<SessionResponseDto[]> {
    const sessions = await this.authRepository.listUserSessions(userId);
    return sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      revokedAt: s.revokedAt?.toISOString() ?? null,
      isCurrent: s.id === currentJti,
    }));
  }

  async revokeSingleSession(
    sessionId: string,
    userId: string,
    currentJti: string | undefined,
  ): Promise<void> {
    if (!currentJti)
      throw new AppException(ErrorCode.AUTH_UNAUTHORIZED, 'Brak identyfikatora sesji.', 401);
    if (sessionId === currentJti)
      throw new AppException(
        ErrorCode.AUTH_SESSION_IS_CURRENT,
        'Nie można wylogować bieżącej sesji. Użyj /logout.',
        400,
      );
    const revoked = await this.authRepository.revokeSessionById(sessionId, userId);
    if (!revoked)
      throw new AppException(ErrorCode.AUTH_SESSION_NOT_FOUND, 'Sesja nie istnieje.', 404);
  }

  async revokeOtherSessions(
    userId: string,
    currentJti: string | undefined,
  ): Promise<{ count: number }> {
    if (!currentJti)
      throw new AppException(ErrorCode.AUTH_UNAUTHORIZED, 'Brak identyfikatora sesji.', 401);
    const count = await this.authRepository.revokeOtherSessions(userId, currentJti);
    return { count };
  }

  // ── Cookies ────────────────────────────────────────────────────────────────

  setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = this.config.get<string>('NODE_ENV') === 'production';

    const base = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      domain: isProd ? '.opony.app' : undefined,
    };

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: ACCESS_TOKEN_TTL * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_TTL * 1000,
      path: '/v1/auth/refresh',
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
    if (user.deletedAt)
      throw new AppException(ErrorCode.AUTH_ACCOUNT_DELETED, 'Konto zostało usunięte.', 401);
    if (user.isBanned)
      throw new AppException(ErrorCode.AUTH_ACCOUNT_BANNED, 'Konto zablokowane.', 401);
  }

  private async buildUserWithProvider(user: {
    id: string;
    phone: string;
    role: UserRole;
  }): Promise<UserWithProvider> {
    const provider = await this.authRepository.findProviderByOwnerId(user.id);
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      ...(provider ? { providerId: provider.id, status: provider.status } : {}),
    };
  }
}
