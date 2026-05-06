import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminDataExportService } from './admin-data-export.service';

@ApiTags('admin')
@Controller('v1/admin/data-export-requests')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@ApiCookieAuth('access_token')
export class AdminDataExportController {
  constructor(private readonly service: AdminDataExportService) {}

  @Get()
  @ApiOperation({ summary: 'Lista wniosków o kopię danych (PENDING)' })
  @ApiResponse({ status: 200, description: 'Paginowana lista wniosków' })
  listPending() {
    return this.service.listPending();
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Oznacz wniosek jako zrealizowany' })
  @ApiResponse({ status: 200, description: 'Wniosek zrealizowany' })
  complete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.complete(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anuluj wniosek o dane' })
  @ApiResponse({ status: 200, description: 'Wniosek anulowany' })
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.cancel(id);
  }
}
