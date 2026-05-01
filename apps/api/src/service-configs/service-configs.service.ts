import { Injectable } from '@nestjs/common';
import { ServiceType } from '@prisma/client';
import { ServiceConfigResponseDto } from './dto/service-config-response.dto';
import { UpsertServiceConfigsDto } from './dto/upsert-service-configs.dto';
import { ServiceConfigsRepository } from './service-configs.repository';

const DEFAULTS: Record<ServiceType, number> = {
  SEASONAL_SWAP: 45,
  WHEEL_SWAP: 30,
  BALANCING: 20,
  PUNCTURE_REPAIR: 25,
};

@Injectable()
export class ServiceConfigsService {
  constructor(private readonly repo: ServiceConfigsRepository) {}

  async getAll(providerId: string): Promise<ServiceConfigResponseDto[]> {
    const saved = await this.repo.findByProvider(providerId);
    const savedMap = new Map(saved.map((s) => [s.serviceType, s.durationMinutes]));
    return (Object.keys(DEFAULTS) as ServiceType[]).map((serviceType) => ({
      serviceType,
      durationMinutes: savedMap.get(serviceType) ?? DEFAULTS[serviceType],
    }));
  }

  async upsertAll(
    providerId: string,
    dto: UpsertServiceConfigsDto,
  ): Promise<ServiceConfigResponseDto[]> {
    await Promise.all(
      dto.configs.map((c) => this.repo.upsertConfig(providerId, c.serviceType, c.durationMinutes)),
    );
    return this.getAll(providerId);
  }
}
