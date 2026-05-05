import { Injectable } from '@nestjs/common';
import { ServiceGroupResponseDto } from './dto/service-group-response.dto';
import { ServiceVariantResponseDto } from './dto/service-variant-response.dto';
import { RimTierDto } from './dto/rim-tier.dto';
import { SubServiceConfigDto } from './dto/sub-service-config.dto';
import { SurchargeResponseDto } from './dto/surcharge-response.dto';
import { UpsertServiceGroupsDto } from './dto/upsert-service-groups.dto';
import { UpsertSurchargesDto } from './dto/upsert-surcharges.dto';
import {
  ServiceGroupsRepository,
  ServiceGroupWithRelations,
  SurchargeRecord,
} from './service-groups.repository';

@Injectable()
export class ServiceGroupsService {
  constructor(private readonly repo: ServiceGroupsRepository) {}

  async getGroups(providerId: string): Promise<ServiceGroupResponseDto[]> {
    const groups = await this.repo.findGroupsByProvider(providerId);
    return groups.map((g) => this.mapGroup(g));
  }

  async replaceGroups(
    providerId: string,
    dto: UpsertServiceGroupsDto,
  ): Promise<ServiceGroupResponseDto[]> {
    const groups = await this.repo.replaceGroups(providerId, dto.groups);
    return groups.map((g) => this.mapGroup(g));
  }

  async getSurcharges(providerId: string): Promise<SurchargeResponseDto[]> {
    const surcharges = await this.repo.findSurchargesByProvider(providerId);
    return surcharges.map((s) => this.mapSurcharge(s));
  }

  async replaceSurcharges(
    providerId: string,
    dto: UpsertSurchargesDto,
  ): Promise<SurchargeResponseDto[]> {
    const surcharges = await this.repo.replaceSurcharges(providerId, dto.surcharges);
    return surcharges.map((s) => this.mapSurcharge(s));
  }

  private mapGroup(group: ServiceGroupWithRelations): ServiceGroupResponseDto {
    return {
      id: group.id,
      name: group.name,
      pricingMode: group.pricingMode,
      sortOrder: group.sortOrder,
      variants: group.variants.map((v) => this.mapVariant(v)),
    };
  }

  private mapVariant(
    variant: ServiceGroupWithRelations['variants'][number],
  ): ServiceVariantResponseDto {
    return {
      id: variant.id,
      name: variant.name,
      enabled: variant.enabled,
      sortOrder: variant.sortOrder,
      rimTiers: variant.rimTiers.map(
        (rt): RimTierDto => ({
          id: rt.id,
          rimSizes: rt.rimSizes,
          pricePln: Number(rt.pricePln),
          durationMinutes: rt.durationMinutes,
          sortOrder: rt.sortOrder,
        }),
      ),
      subServices: variant.subServices.map(
        (ss): SubServiceConfigDto => ({
          id: ss.id,
          name: ss.name,
          included: ss.included,
          enabled: ss.enabled,
          fromCatalog: ss.fromCatalog,
          pricePln: ss.pricePln !== null ? Number(ss.pricePln) : null,
          durationMinutes: ss.durationMinutes,
          sortOrder: ss.sortOrder,
        }),
      ),
    };
  }

  private mapSurcharge(surcharge: SurchargeRecord): SurchargeResponseDto {
    return {
      id: surcharge.id,
      name: surcharge.name,
      enabled: surcharge.enabled,
      scope: surcharge.scope,
      pricePln: Number(surcharge.pricePln),
      sortOrder: surcharge.sortOrder,
    };
  }
}
