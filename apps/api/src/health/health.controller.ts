import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

interface HealthResponse {
  status: string;
  version: string;
}

@ApiTags('health')
@Controller('v1/health')
export class HealthController {
  @Public()
  @ApiOperation({ summary: 'Health check', description: 'Returns API status and version' })
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      version: '0.1.0',
    };
  }
}
