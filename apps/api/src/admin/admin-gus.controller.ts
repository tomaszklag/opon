import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export type GusHealthStatus = 'ok' | 'degraded' | 'down';

export interface GusHealthResponseDto {
  status: GusHealthStatus;
  checkedAt: string;
  message: string;
}

@ApiTags('admin')
@Controller('v1/admin/gus')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@ApiCookieAuth('access_token')
export class AdminGusController {
  private readonly logger = new Logger(AdminGusController.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly isMock: boolean;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('GUS_API_KEY');
    this.isMock = config.get<string>('GUS_MOCK') === 'true';
    this.baseUrl = config.get<string>('GUS_BASE_URL', 'https://dane.biznes.gov.pl/api/ceidg/v3');
  }

  // ── GET /v1/admin/gus/health ───────────────────────────────────────────────

  @Get('health')
  @ApiOperation({ summary: 'Sprawdź status połączenia z CEIDG (admin)' })
  @ApiResponse({ status: 200, description: 'Status CEIDG' })
  @ApiResponse({ status: 403, description: 'Brak uprawnień' })
  async getHealth(): Promise<GusHealthResponseDto> {
    const checkedAt = new Date().toISOString();

    if (this.isMock) {
      return {
        status: 'ok',
        checkedAt,
        message: 'Tryb testowy (GUS_MOCK=true) — CEIDG nie jest odpytywane.',
      };
    }

    // Probe with a clearly fictional NIP — any JSON response (even error) means API is reachable
    const probeUrl = `${this.baseUrl}/firmy?nip=0000000000`;

    let response: Response;
    try {
      response = await fetch(probeUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.logger.warn(`CEIDG health probe failed: ${reason}`);
      return {
        status: 'down',
        checkedAt,
        message: `Brak połączenia z CEIDG: ${reason}`,
      };
    }

    this.logger.debug(`CEIDG health probe → HTTP ${response.status}`);

    let body: string;
    try {
      body = await response.text();
    } catch {
      return {
        status: 'degraded',
        checkedAt,
        message: `CEIDG odpowiedział HTTP ${response.status}, ale nie udało się odczytać treści odpowiedzi.`,
      };
    }

    // Try parsing JSON — if it parses, the API is responding correctly
    try {
      JSON.parse(body);
      return {
        status: 'ok',
        checkedAt,
        message: `CEIDG działa poprawnie (HTTP ${response.status}).`,
      };
    } catch {
      // Got a response but it's not JSON (likely HTML maintenance page)
      const snippet = body.slice(0, 120).replace(/\s+/g, ' ');
      this.logger.warn(
        `CEIDG health probe: non-JSON response (HTTP ${response.status}): ${snippet}`,
      );
      return {
        status: 'degraded',
        checkedAt,
        message: `CEIDG zwróciło nieprawidłową odpowiedź (HTTP ${response.status}) — możliwa przerwa serwisowa.`,
      };
    }
  }
}
