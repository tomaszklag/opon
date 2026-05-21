import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ConsentType } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { AppException, ErrorCode } from '../common/errors';
import { EmailVerificationService } from '../email/email-verification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { ChangePhoneDto } from './dto/change-phone.dto';
import { ChangePhoneResponseDto } from './dto/change-phone-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { RequestOtpResponseDto } from './dto/request-otp-response.dto';
import { SessionResponseDto } from './dto/session-response.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyOtpResponseDto } from './dto/verify-otp-response.dto';
import { OtpService } from './otp.service';
import { JwtPayload } from './types/jwt-payload.interface';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ── POST /v1/auth/request-otp ──────────────────────────────────────────────

  @Public()
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Wyślij kod OTP na podany numer telefonu' })
  @ApiResponse({ status: 200, type: RequestOtpResponseDto })
  @ApiResponse({ status: 429, description: 'Zbyt wiele prób' })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    const result = await this.otpService.requestOtp(dto.phone);
    return {
      message: result.alreadySent ? 'Kod OTP już wysłany' : 'Kod OTP wysłany',
      expiresIn: result.expiresIn,
      alreadySent: result.alreadySent,
    };
  }

  // ── POST /v1/auth/verify-otp ───────────────────────────────────────────────

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Zweryfikuj kod OTP i zaloguj użytkownika' })
  @ApiResponse({ status: 200, type: VerifyOtpResponseDto })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy lub wygasły kod' })
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResponseDto> {
    const valid = await this.otpService.verifyOtp(dto.phone, dto.code);
    if (!valid)
      throw new AppException(
        ErrorCode.OTP_INVALID_OR_EXPIRED,
        'Nieprawidłowy lub wygasły kod OTP.',
        401,
      );

    const { isNewUser, ...user } = await this.authService.findOrCreateUser(dto.phone);

    const jti = randomUUID();
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      ...(user.providerId ? { providerId: user.providerId, status: user.status } : {}),
    };

    const { accessToken, refreshToken } = this.authService.issueTokens(payload, jti);

    await this.authService.createSession(user.id, jti, refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    this.authService.setAuthCookies(res, accessToken, refreshToken);

    // Fetch full user record for mobile response
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, phone: true, firstName: true, lastName: true, email: true, role: true },
    });

    // Check consent: requiresConsent = true if user has no accepted TERMS consent
    const termsConsent = await this.prisma.consentLog.findFirst({
      where: { userId: user.id, consentType: ConsentType.TERMS, accepted: true },
    });
    const requiresConsent = termsConsent === null;

    return {
      message: 'Zalogowano',
      role: user.role,
      ...(user.providerId ? { providerId: user.providerId } : {}),
      accessToken,
      refreshToken,
      user: fullUser
        ? {
            id: fullUser.id,
            phone: fullUser.phone,
            firstName: fullUser.firstName,
            lastName: fullUser.lastName,
            email: fullUser.email,
            role: fullUser.role,
          }
        : undefined,
      requiresConsent,
      isNewUser,
    };
  }

  // ── POST /v1/auth/refresh ──────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Odśwież access token używając refresh cookie lub body (mobile)' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Brak, nieprawidłowy lub skradziony refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body?: RefreshTokenDto,
  ): Promise<MessageResponseDto & { accessToken?: string; refreshToken?: string }> {
    const oldRefreshToken =
      (req.cookies?.['refresh_token'] as string | undefined) ?? body?.refreshToken;
    if (!oldRefreshToken)
      throw new AppException(ErrorCode.AUTH_UNAUTHORIZED, 'Brak refresh token.', 401);

    const payload = this.authService.verifyRefreshToken(oldRefreshToken);
    if (!payload.jti)
      throw new AppException(
        ErrorCode.AUTH_UNAUTHORIZED,
        'Sesja nieważna — zaloguj się ponownie.',
        401,
      );

    // Upewnij się że użytkownik nadal istnieje i jest aktywny — nigdy nie twórz nowego
    const user = await this.authService.findUser(payload.phone);

    const newJti = randomUUID();
    const newPayload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      ...(user.providerId ? { providerId: user.providerId, status: user.status } : {}),
    };

    const { accessToken, refreshToken: newRefreshToken } = this.authService.issueTokens(
      newPayload,
      newJti,
    );

    // Rotacja: unieważnij starą sesję, utwórz nową (transakcja w serwisie)
    await this.authService.rotateSession(
      payload.jti,
      user.id,
      oldRefreshToken,
      newJti,
      newRefreshToken,
      { userAgent: req.headers['user-agent'], ipAddress: req.ip },
    );

    this.authService.setAuthCookies(res, accessToken, newRefreshToken);
    return { message: 'Token odświeżony', accessToken, refreshToken: newRefreshToken };
  }

  // ── POST /v1/auth/logout ───────────────────────────────────────────────────

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Wyloguj użytkownika — unieważnia sesję i usuwa cookies' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    if (user.jti) {
      await this.authService.revokeSession(user.jti);
    }
    this.authService.clearAuthCookies(res);
    return { message: 'Wylogowano' };
  }

  // ── PATCH /v1/auth/change-phone ───────────────────────────────────────────

  @Patch('change-phone')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zmień numer telefonu — wymaga OTP na stary i nowy numer' })
  @ApiResponse({ status: 200, type: ChangePhoneResponseDto })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy lub wygasły kod OTP' })
  @ApiResponse({ status: 409, description: 'Numer telefonu jest już w użyciu' })
  async changePhone(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePhoneDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ChangePhoneResponseDto> {
    await this.authService.changePhone(
      user.sub,
      user.phone,
      dto.currentCode,
      dto.newPhone,
      dto.newCode,
    );

    // Re-issue access token with updated phone (session jti stays the same)
    if (user.jti) {
      const newPayload: JwtPayload = { ...user, phone: dto.newPhone };
      const accessToken = this.authService.issueAccessToken(newPayload, user.jti);
      this.authService.setAccessTokenCookie(res, accessToken);
    }

    return { message: 'Numer telefonu zmieniony', phone: dto.newPhone };
  }

  // ── GET /v1/auth/verify-email ──────────────────────────────────────────────

  @Public()
  @Get('verify-email')
  @ApiOperation({ summary: 'Weryfikacja adresu email providera' })
  @ApiQuery({ name: 'token', type: String })
  async verifyEmail(@Query('token') token: string, @Res() res: Response): Promise<void> {
    const panelUrl = this.config.get<string>('PANEL_URL', 'http://localhost:3000');
    const result = await this.emailVerificationService.verifyToken(token);
    if (!result) {
      res.redirect(`${panelUrl}/verify-email?error=invalid`);
      return;
    }
    res.redirect(`${panelUrl}/verify-email?success=1`);
  }

  // ── GET /v1/auth/me ────────────────────────────────────────────────────────

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Dane zalogowanego użytkownika' })
  @ApiResponse({ status: 200, type: AuthMeResponseDto })
  @ApiResponse({ status: 401, description: 'Nieautoryzowany' })
  me(@CurrentUser() user: JwtPayload): JwtPayload {
    return user;
  }

  // ── GET /v1/auth/sessions ──────────────────────────────────────────────────

  @Get('sessions')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lista sesji zalogowanego użytkownika (aktywnych i historycznych)' })
  @ApiResponse({ status: 200, type: [SessionResponseDto] })
  async listSessions(@CurrentUser() user: JwtPayload): Promise<SessionResponseDto[]> {
    return this.authService.listSessions(user.sub, user.jti);
  }

  // ── DELETE /v1/auth/sessions/:id ──────────────────────────────────────────

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Wyloguj wybrane urządzenie (nie można wylogować bieżącej sesji)' })
  @ApiResponse({ status: 204, description: 'Sesja unieważniona' })
  @ApiResponse({ status: 400, description: 'To jest bieżąca sesja — użyj /logout' })
  @ApiResponse({ status: 404, description: 'Sesja nie istnieje' })
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.authService.revokeSingleSession(id, user.sub, user.jti);
  }

  // ── DELETE /v1/auth/sessions ───────────────────────────────────────────────

  @Delete('sessions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Wyloguj wszystkie inne urządzenia (zachowuje bieżącą sesję)' })
  @ApiResponse({ status: 204, description: 'Pozostałe sesje unieważnione' })
  async revokeOtherSessions(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.authService.revokeOtherSessions(user.sub, user.jti);
  }
}
