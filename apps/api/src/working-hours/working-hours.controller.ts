import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { UpsertWorkingHoursDto } from './dto/upsert-working-hours.dto';
import { WorkingHoursService } from './working-hours.service';

@ApiTags('working-hours')
@Controller('v1/providers')
export class WorkingHoursController {
  constructor(
    private readonly service: WorkingHoursService,
    private readonly providersService: ProvidersService,
  ) {}

  // ── GET /v1/providers/me/working-hours ────────────────────────────────────

  @Get('me/working-hours')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Moje godziny pracy' })
  async listMine(@CurrentUser() user: JwtPayload) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.listByProvider(provider.id);
  }

  // ── PUT /v1/providers/me/working-hours ────────────────────────────────────

  @Put('me/working-hours')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Ustaw / zaktualizuj godziny pracy (upsert per dzień)' })
  async upsert(@CurrentUser() user: JwtPayload, @Body() dto: UpsertWorkingHoursDto) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.upsert(provider.id, dto);
  }

  // ── GET /v1/providers/:providerId/working-hours (publiczne) ───────────────

  @Public()
  @Get(':providerId/working-hours')
  @ApiOperation({ summary: 'Godziny pracy firmy (publiczne)' })
  listByProvider(@Param('providerId', ParseUUIDPipe) providerId: string) {
    return this.service.listByProvider(providerId);
  }
}
