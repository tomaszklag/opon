import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('health')
@Controller('v1/health')
export class HealthController {
  @Public()
  @ApiOperation({ summary: 'Health check', description: 'Returns API status and version' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  @Get()
  check(): HealthResponseDto {
    return {
      status: 'ok',
      version: '0.1.0',
    };
  }
}
