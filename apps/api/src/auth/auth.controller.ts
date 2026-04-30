import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { AppException, ErrorCode } from '../common/errors';
import { EmailVerificationService } from '../email/email-verification.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { AuthMeResponseDto } from './dto/auth-me-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { RequestOtpResponseDto } from './dto/request-otp-response.dto';
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
  ) {}

  // ── POST /v1/auth/request-otp ──────────────────────────────────────────────

  @Public()
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Wyślij kod OTP na podany numer telefonu' })
  @ApiResponse({ status: 200, type: RequestOtpResponseDto })
  @ApiResponse({ status: 429, description: 'Zbyt wiele prób' })
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    await this.otpService.requestOtp(dto.phone);
    return { message: 'Kod OTP wysłany', expiresIn: 300 };
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
  ): Promise<{ message: string; role: string; providerId?: string }> {
    const valid = await this.otpService.verifyOtp(dto.phone, dto.code);
    if (!valid)
      throw new AppException(
        ErrorCode.OTP_INVALID_OR_EXPIRED,
        'Nieprawidłowy lub wygasły kod OTP.',
        401,
      );

    const user = await this.authService.findOrCreateUser(dto.phone);

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

    return {
      message: 'Zalogowano',
      role: user.role,
      ...(user.providerId ? { providerId: user.providerId } : {}),
    };
  }

  // ── POST /v1/auth/refresh ──────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Odśwież access token używając refresh cookie' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Brak, nieprawidłowy lub skradziony refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const oldRefreshToken = req.cookies?.['refresh_token'] as string | undefined;
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
    return { message: 'Token odświeżony' };
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
}
