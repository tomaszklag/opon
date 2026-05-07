import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { ProvidersService } from '../providers/providers.service';
import { CreateScheduleExceptionDto } from './dto/create-schedule-exception.dto';
import { ScheduleExceptionResponseDto } from './dto/schedule-exception-response.dto';
import { ScheduleExceptionsService } from './schedule-exceptions.service';

@ApiTags('schedule-exceptions')
@ApiCookieAuth('access_token')
@Controller('v1/providers/me/schedule-exceptions')
export class ScheduleExceptionsController {
  constructor(
    private readonly service: ScheduleExceptionsService,
    private readonly providersService: ProvidersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista wyjątków (od -7 dni wzwyż)' })
  @ApiResponse({ status: 200, type: [ScheduleExceptionResponseDto] })
  async list(@CurrentUser() user: JwtPayload) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.list(provider.id);
  }

  @Post()
  @ApiOperation({ summary: 'Dodaj / zaktualizuj wyjątek (upsert per data)' })
  @ApiResponse({ status: 201, type: ScheduleExceptionResponseDto })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateScheduleExceptionDto) {
    const provider = await this.providersService.getMyProvider(user.sub);
    return this.service.create(provider.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Usuń wyjątek' })
  @ApiResponse({ status: 204 })
  async remove(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    const provider = await this.providersService.getMyProvider(user.sub);
    await this.service.remove(id, provider.id);
  }
}
