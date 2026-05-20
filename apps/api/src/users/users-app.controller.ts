import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ConsentType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostConsentDto } from '../auth/dto/post-consent.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { AppException, ErrorCode } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';
import { AddVehicleDto } from './dto/add-vehicle.dto';
import { AppUserResponseDto } from './dto/app-user-response.dto';
import { AppVehicleResponseDto } from './dto/app-vehicle-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('app-users')
@ApiBearerAuth()
@Roles(UserRole.CLIENT)
@Controller('v1/app/users/me')
export class UsersAppController {
  constructor(private readonly prisma: PrismaService) {}

  // ── GET /v1/app/users/me ──────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: AppUserResponseDto })
  async getMe(@CurrentUser() user: JwtPayload): Promise<AppUserResponseDto> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, phone: true, firstName: true, lastName: true, email: true, role: true },
    });

    if (!dbUser) {
      throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND, 'Użytkownik nie istnieje.', 404);
    }

    return {
      id: dbUser.id,
      phone: dbUser.phone,
      firstName: dbUser.firstName ?? null,
      lastName: dbUser.lastName ?? null,
      email: dbUser.email ?? null,
      role: dbUser.role as 'CLIENT' | 'PROVIDER',
    };
  }

  // ── PATCH /v1/app/users/me ────────────────────────────────────────────────

  @Patch()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: AppUserResponseDto })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<AppUserResponseDto> {
    const updated = await this.prisma.user.update({
      where: { id: user.sub },
      data: {
        ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
        ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
      },
      select: { id: true, phone: true, firstName: true, lastName: true, email: true, role: true },
    });

    return {
      id: updated.id,
      phone: updated.phone,
      firstName: updated.firstName ?? null,
      lastName: updated.lastName ?? null,
      email: updated.email ?? null,
      role: updated.role as 'CLIENT' | 'PROVIDER',
    };
  }

  // ── GET /v1/app/users/me/vehicles ─────────────────────────────────────────

  @Get('vehicles')
  @ApiOperation({ summary: 'List vehicles for current user' })
  @ApiOkResponse({ type: [AppVehicleResponseDto] })
  async listVehicles(@CurrentUser() user: JwtPayload): Promise<AppVehicleResponseDto[]> {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles.map((v) => ({
      id: v.id,
      nickname: v.nickname ?? null,
      make: v.make ?? '',
      model: v.model ?? '',
      year: v.year ?? 0,
      tireSize: v.tireSize,
    }));
  }

  // ── POST /v1/app/users/me/vehicles ────────────────────────────────────────

  @Post('vehicles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a vehicle for current user' })
  @ApiCreatedResponse({ type: AppVehicleResponseDto })
  async addVehicle(
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddVehicleDto,
  ): Promise<AppVehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.create({
      data: {
        userId: user.sub,
        nickname: dto.nickname ?? null,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        tireSize: dto.tireSize,
      },
    });

    return {
      id: vehicle.id,
      nickname: vehicle.nickname ?? null,
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      year: vehicle.year ?? 0,
      tireSize: vehicle.tireSize,
    };
  }

  // ── POST /v1/app/users/me/consent ────────────────────────────────────────

  @Post('consent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Zapisz zgody użytkownika (RODO / regulamin)' })
  @ApiNoContentResponse({ description: 'Zgody zapisane' })
  async postConsent(@CurrentUser() user: JwtPayload, @Body() dto: PostConsentDto): Promise<void> {
    const CONSENT_VERSION = '1.0';
    const consentEntries: Array<{ consentType: ConsentType; accepted: boolean }> = [
      { consentType: ConsentType.TERMS, accepted: dto.termsAccepted },
      { consentType: ConsentType.PRIVACY, accepted: dto.privacyAccepted },
    ];
    if (dto.marketingAccepted !== undefined) {
      consentEntries.push({ consentType: ConsentType.MARKETING, accepted: dto.marketingAccepted });
    }
    await this.prisma.consentLog.createMany({
      data: consentEntries.map((entry) => ({
        userId: user.sub,
        consentType: entry.consentType,
        version: CONSENT_VERSION,
        accepted: entry.accepted,
      })),
    });
  }

  // ── DELETE /v1/app/users/me/vehicles/:id ──────────────────────────────────

  @Delete('vehicles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiNoContentResponse()
  async deleteVehicle(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId: user.sub },
      select: { id: true },
    });

    if (!vehicle) {
      throw new AppException(ErrorCode.NOT_FOUND, 'Pojazd nie istnieje lub brak dostępu.', 404);
    }

    await this.prisma.vehicle.delete({ where: { id } });
  }
}
