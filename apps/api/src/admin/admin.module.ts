import { Module } from '@nestjs/common';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminProvidersService } from './admin-providers.service';
import { AdminGusController } from './admin-gus.controller';
import { AdminDataExportController } from './admin-data-export.controller';
import { AdminDataExportService } from './admin-data-export.service';

@Module({
  controllers: [AdminProvidersController, AdminGusController, AdminDataExportController],
  providers: [AdminProvidersService, AdminDataExportService],
})
export class AdminModule {}
