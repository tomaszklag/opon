import { Injectable } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import type { ServiceResponseDto } from './dto/service-response.dto';
import type { AddonResponseDto } from './dto/addon-response.dto';
import type { UpsertServicesDto } from './dto/upsert-services.dto';
import type { UpsertAddonsDto } from './dto/upsert-addons.dto';

type DbService = Awaited<ReturnType<ServicesRepository['findAll']>>[number];
type DbAddon = Awaited<ReturnType<ServicesRepository['findAllAddons']>>[number];

function toServiceDto(s: DbService): ServiceResponseDto {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    pricingType: s.pricingType,
    enabled: s.enabled,
    sortOrder: s.sortOrder,
    variants: s.variants.map((v) => ({
      id: v.id,
      name: v.name,
      rimSizes: v.rimSizes,
      pricePln: Number(v.pricePln),
      durationMinutes: v.durationMinutes,
      sortOrder: v.sortOrder,
    })),
    subServiceIds: s.subLinks.map((l) => l.subId),
    addonIds: s.addonLinks.map((l) => l.addonId),
  };
}

function toAddonDto(a: DbAddon): AddonResponseDto {
  return {
    id: a.id,
    name: a.name,
    pricePln: Number(a.pricePln),
    durationMinutes: a.durationMinutes,
    enabled: a.enabled,
    sortOrder: a.sortOrder,
  };
}

@Injectable()
export class ServicesService {
  constructor(private readonly repo: ServicesRepository) {}

  async getServices(providerId: string): Promise<ServiceResponseDto[]> {
    return (await this.repo.findAll(providerId)).map(toServiceDto);
  }

  async replaceServices(providerId: string, dto: UpsertServicesDto): Promise<ServiceResponseDto[]> {
    return (await this.repo.replaceAll(providerId, dto.services)).map(toServiceDto);
  }

  async deleteService(id: string, providerId: string): Promise<{ hardDeleted: boolean }> {
    const hardDeleted = await this.repo.deleteService(id, providerId);
    return { hardDeleted };
  }

  async getAddons(providerId: string): Promise<AddonResponseDto[]> {
    return (await this.repo.findAllAddons(providerId)).map(toAddonDto);
  }

  async replaceAddons(providerId: string, dto: UpsertAddonsDto): Promise<AddonResponseDto[]> {
    return (await this.repo.replaceAllAddons(providerId, dto.addons)).map(toAddonDto);
  }

  async deleteAddon(id: string, providerId: string): Promise<{ hardDeleted: boolean }> {
    const hardDeleted = await this.repo.deleteAddon(id, providerId);
    return { hardDeleted };
  }
}
