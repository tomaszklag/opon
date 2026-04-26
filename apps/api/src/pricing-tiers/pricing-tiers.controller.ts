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
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { CreatePricingTierDto } from './dto/create-pricing-tier.dto';
import { PricingTierResponseDto } from './dto/pricing-tier-response.dto';
import { UpdatePricingTierDto } from './dto/update-pricing-tier.dto';
import { PricingTiersService } from './pricing-tiers.service';

@ApiTags('pricing-tiers')
@Controller('v1/providers')
export class PricingTiersController {
  constructor(
    private readonly service: PricingTiersService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/pricing-tiers ────────────────────────────────────

  @Get('me/pricing-tiers')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Lista moich tierów cenowych' })
  @ApiResponse({ status: 200, type: [PricingTierResponseDto] })
  async listMine(@CurrentUser() user: JwtPayload) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listByProvider(provider.id);
  }

  // ── POST /v1/providers/me/pricing-tiers ───────────────────────────────────

  @Post('me/pricing-tiers')
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Dodaj tier cenowy' })
  @ApiResponse({ status: 201, type: PricingTierResponseDto })
  @ApiResponse({ status: 409, description: 'Przedział felg już istnieje' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePricingTierDto) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.create(provider.id, dto);
  }

  // ── PATCH /v1/providers/me/pricing-tiers/:id ──────────────────────────────

  @Patch('me/pricing-tiers/:id')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Zaktualizuj tier cenowy' })
  @ApiResponse({ status: 200, type: PricingTierResponseDto })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePricingTierDto,
  ) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.update(id, provider.id, dto);
  }

  // ── DELETE /v1/providers/me/pricing-tiers/:id ─────────────────────────────

  @Delete('me/pricing-tiers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Usuń tier cenowy' })
  async remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const provider = await this.providersService.getMyProvider(user.sub);
    await this.service.remove(id, provider.id);
  }

  // ── GET /v1/providers/:providerId/pricing-tiers (publiczne) ───────────────

  @Public()
  @Get(':providerId/pricing-tiers')
  @ApiOperation({ summary: 'Lista tierów cenowych firmy (publiczne)' })
  @ApiResponse({ status: 200, type: [PricingTierResponseDto] })
  listByProvider(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.service.listByProvider(providerId);
  }
}
