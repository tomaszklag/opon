import { Injectable } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceConfigsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProvider(providerId: string) {
    return this.prisma.serviceConfig.findMany({ where: { providerId } });
  }

  upsertConfig(providerId: string, serviceType: ServiceType, durationMinutes: number) {
    return this.prisma.serviceConfig.upsert({
      where: { providerId_serviceType: { providerId, serviceType } },
      create: { providerId, serviceType, durationMinutes },
      update: { durationMinutes },
    });
  }
}
