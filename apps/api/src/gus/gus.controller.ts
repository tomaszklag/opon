import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { GusService, GusResult } from './gus.service';

@ApiTags('gus')
@Controller('v1/gus')
export class GusController {
  constructor(private readonly gus: GusService) {}

  @Public()
  @Get(':nip')
  @ApiOperation({ summary: 'Pobierz dane firmy z CEIDG po NIP' })
  @ApiParam({ name: 'nip', description: '10-cyfrowy NIP' })
  @ApiResponse({ status: 200, description: 'Dane firmy z CEIDG' })
  @ApiResponse({ status: 400, description: 'Nieprawidłowy NIP' })
  @ApiResponse({ status: 404, description: 'NIP nie znaleziony w CEIDG' })
  async getByNip(@Param('nip') nip: string): Promise<GusResult> {
    if (!/^\d{10}$/.test(nip)) {
      throw new BadRequestException('NIP musi mieć dokładnie 10 cyfr.');
    }
    return this.gus.lookupByNip(nip);
  }
}
