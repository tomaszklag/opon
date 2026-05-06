import { Injectable } from '@nestjs/common';
import { NotificationPreferences } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class NotificationPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(providerId: string): Promise<NotificationPreferences> {
    const existing = await this.prisma.notificationPreferences.findUnique({
      where: { providerId },
    });
    if (existing) return existing;
    return this.prisma.notificationPreferences.create({ data: { providerId } });
  }

  upsert(
    providerId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    return this.prisma.notificationPreferences.upsert({
      where: { providerId },
      create: { providerId, ...dto },
      update: dto,
    });
  }
}
