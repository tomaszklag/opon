import {
  Body,
  Controller,
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
import { CreateProviderDto } from './dto/create-provider.dto';
import { ListProvidersQueryDto } from './dto/list-providers-query.dto';
import { ProviderPageResponseDto } from './dto/provider-page-response.dto';
import { ProviderResponseDto } from './dto/provider-response.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProvidersService } from './providers.service';

@ApiTags('providers')
@Controller('v1/providers')
export class ProvidersController {
  constructor(private readonly service: ProvidersService) {}

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
