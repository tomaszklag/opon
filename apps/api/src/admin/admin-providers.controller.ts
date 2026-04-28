import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminProvidersService } from './admin-providers.service';
import { AdminProviderListQueryDto } from './dto/admin-provider-list-query.dto';
import { RejectProviderDto } from './dto/reject-provider.dto';

@ApiTags('admin')
@Controller('v1/admin/providers')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@ApiCookieAuth('access_token')
export class AdminProvidersController {
  constructor(private readonly service: AdminProvidersService) {}

  // ── GET /v1/admin/providers ────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Lista firm (admin) — opcjonalne filtrowanie po statusie' })
  @ApiResponse({ status: 200, description: 'Paginowana lista firm' })
  @ApiResponse({ status: 403, description: 'Brak uprawnień' })
  listProviders(@Query() query: AdminProviderListQueryDto) {
    return this.service.listProviders(query);
  }

  // ── PATCH /v1/admin/providers/:id/approve ─────────────────────────────────

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Zatwierdź firmę (PENDING_APPROVAL → APPROVED)' })
  @ApiResponse({ status: 200, description: 'Firma zatwierdzona' })
  @ApiResponse({ status: 400, description: 'Firma nie jest w stanie oczekującym na weryfikację' })
  @ApiResponse({ status: 403, description: 'Brak uprawnień' })
  @ApiResponse({ status: 404, description: 'Firma nie istnieje' })
  approveProvider(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.approveProvider(id);
  }

  // ── PATCH /v1/admin/providers/:id/reject ──────────────────────────────────

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Odrzuć firmę (PENDING_APPROVAL → REJECTED)' })
  @ApiResponse({ status: 200, description: 'Firma odrzucona' })
  @ApiResponse({ status: 400, description: 'Firma nie jest w stanie oczekującym na weryfikację' })
  @ApiResponse({ status: 403, description: 'Brak uprawnień' })
  @ApiResponse({ status: 404, description: 'Firma nie istnieje' })
  rejectProvider(@Param('id', ParseUUIDPipe) id: string, @Body() body: RejectProviderDto) {
    return this.service.rejectProvider(id, body.reason);
  }
}
