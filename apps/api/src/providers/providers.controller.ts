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
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { EmailChangeService } from '../email/email-change.service';
import { AddPhotoDto } from './dto/add-photo.dto';
import { ConfirmEmailChangeDto } from './dto/confirm-email-change.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ListProvidersQueryDto } from './dto/list-providers-query.dto';
import { PhotoResponseDto } from './dto/photo-response.dto';
import { ProviderPageResponseDto } from './dto/provider-page-response.dto';
import { ProviderPauseResponseDto } from './dto/provider-pause-response.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { SetProviderPauseDto } from './dto/set-provider-pause.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProvidersService } from './providers.service';

@ApiTags('providers')
@Controller('v1/providers')
export class ProvidersController {
  constructor(
    private readonly service: ProvidersService,
    private readonly emailChangeService: EmailChangeService,
  ) {}

  // ── POST /v1/providers ─────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zarejestruj firmę — zmienia rolę usera na PROVIDER_OWNER' })
  @ApiResponse({ status: 201, type: ProviderResponseDto })
  @ApiResponse({ status: 409, description: 'Firma już istnieje lub NIP zajęty' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProviderDto) {
    return this.service.create(user.sub, dto);
  }

  // ── GET /v1/providers ──────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista zatwierdzonych firm (publiczne)' })
  @ApiResponse({ status: 200, type: ProviderPageResponseDto })
  listApproved(@Query() query: ListProvidersQueryDto) {
    return this.service.listApproved(query);
  }

  // ── GET /v1/providers/me ───────────────────────────────────────────────────

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Moja firma' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  @ApiResponse({ status: 404, description: 'Brak zarejestrowanej firmy' })
  getMyProvider(@CurrentUser() user: JwtPayload) {
    return this.service.getMyProvider(user.sub);
  }

  // ── PATCH /v1/providers/me ─────────────────────────────────────────────────

  @Patch('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Aktualizuj dane swojej firmy' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  @ApiResponse({ status: 404, description: 'Brak zarejestrowanej firmy' })
  updateMyProvider(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProviderDto) {
    return this.service.updateMyProvider(user.sub, dto);
  }

  // ── GET /v1/providers/me/photos ───────────────────────────────────────────

  @Get('me/photos')
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 200, type: [PhotoResponseDto] })
  getMyPhotos(@CurrentUser() user: JwtPayload) {
    return this.service.getMyPhotos(user.sub);
  }

  // ── POST /v1/providers/me/photos ──────────────────────────────────────────

  @Post('me/photos')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiResponse({ status: 201, type: PhotoResponseDto })
  addPhoto(@CurrentUser() user: JwtPayload, @Body() dto: AddPhotoDto) {
    return this.service.addPhoto(user.sub, dto);
  }

  // ── PATCH /v1/providers/me/photos/reorder ─────────────────────────────────

  @Patch('me/photos/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  reorderPhotos(@CurrentUser() user: JwtPayload, @Body() dto: ReorderPhotosDto) {
    return this.service.reorderPhotos(user.sub, dto);
  }

  // ── DELETE /v1/providers/me/photos/:id ────────────────────────────────────

  @Delete('me/photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  deletePhoto(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.deletePhoto(user.sub, id);
  }

  // ── PATCH /v1/providers/me/pause ─────────────────────────────────────────

  @Patch('me/pause')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ustaw pauzę warsztatu (null = odblokuj)' })
  @ApiResponse({ status: 200, type: ProviderPauseResponseDto })
  pause(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SetProviderPauseDto,
  ): Promise<ProviderPauseResponseDto> {
    return this.service.setProviderPause(user.sub, dto.until ?? null);
  }

  // ── POST /v1/providers/me/suspend ────────────────────────────────────────

  @Post('me/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zawieś widoczność warsztatu (APPROVED → SUSPENDED)' })
  @ApiResponse({ status: 200, description: 'Warsztat zawieszony' })
  @ApiResponse({ status: 400, description: 'Firma nie jest w stanie aktywnym' })
  selfSuspend(@CurrentUser() user: JwtPayload) {
    return this.service.selfSuspend(user.sub);
  }

  // ── POST /v1/providers/me/deletion-request ────────────────────────────────

  @Post('me/deletion-requests')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Złóż wniosek o usunięcie konta (APPROVED → PENDING_DELETION)' })
  @ApiResponse({ status: 200, description: 'Wniosek przyjęty' })
  @ApiResponse({ status: 400, description: 'Firma nie jest w stanie aktywnym' })
  requestDeletion(@CurrentUser() user: JwtPayload) {
    return this.service.requestDeletion(user.sub);
  }

  // ── POST /v1/providers/me/data-export-requests ────────────────────────────

  @Post('me/data-export-requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zamów kopię danych (RODO art. 20)' })
  @ApiResponse({ status: 201, description: 'Wniosek przyjęty' })
  @ApiResponse({ status: 409, description: 'Masz już oczekujący wniosek' })
  requestDataExport(@CurrentUser() user: JwtPayload) {
    return this.service.requestDataExport(user.sub);
  }

  // ── POST /v1/providers/me/email/request-otp ───────────────────────────────

  @Post('me/email/request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Wyślij kod OTP na nowy adres email' })
  @ApiResponse({ status: 200, description: 'Kod wysłany' })
  @ApiResponse({ status: 429, description: 'Zbyt wiele prób' })
  async requestEmailChangeOtp(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestEmailChangeDto,
  ): Promise<{ message: string; expiresIn: number; alreadySent: boolean }> {
    const result = await this.emailChangeService.requestOtp(user.providerId!, dto.newEmail);
    return {
      message: result.alreadySent ? 'Kod już wysłany' : 'Kod wysłany',
      expiresIn: result.expiresIn,
      alreadySent: result.alreadySent,
    };
  }

  // ── PATCH /v1/providers/me/email ──────────────────────────────────────────

  @Patch('me/email')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Potwierdź zmianę adresu email kodem OTP' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  @ApiResponse({ status: 401, description: 'Nieprawidłowy lub wygasły kod' })
  async confirmEmailChange(@CurrentUser() user: JwtPayload, @Body() dto: ConfirmEmailChangeDto) {
    await this.emailChangeService.confirmChange(user.providerId!, dto.newEmail, dto.code);
    return this.service.getMyProvider(user.sub);
  }

  // ── GET /v1/providers/:id ──────────────────────────────────────────────────

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Szczegóły zatwierdzonej firmy (publiczne)' })
  @ApiResponse({ status: 200, type: ProviderResponseDto })
  @ApiResponse({ status: 404, description: 'Firma nie istnieje' })
  @ApiResponse({ status: 403, description: 'Firma nie jest zatwierdzona' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getApprovedById(id);
  }
}
