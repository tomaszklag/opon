import { Controller, Get } from '@nestjs/common';

interface HealthResponse {
  status: string;
  version: string;
}

@Controller('v1/health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      version: '0.1.0',
    };
  }
}
