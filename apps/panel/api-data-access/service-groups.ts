// Compatibility shim — transforms new Services API to old ManualBookingModal shape
import { api } from '../lib/api';
import type { components } from '@opony/api-client';

type RawService = components['schemas']['ServiceResponseDto'];
type RawVariant = components['schemas']['ServiceVariantResponseDto'];

// ── Types expected by ManualBookingModal ──────────────────────────────────────

export interface SubServiceResponse {
  id: string;
  name: string;
  included: boolean;
  enabled: boolean;
  fromCatalog: boolean;
  pricePln: number | null;
  durationMinutes: number | null;
  sortOrder: number;
}

export interface ServiceVariantResponse {
  id: string;
  name: string;
  enabled: boolean;
  sortOrder: number;
  rimTiers: { rimSizes: string[]; pricePln: number; durationMinutes: number; sortOrder: number }[];
  subServices: SubServiceResponse[];
}

export interface ServiceGroupResponse {
  id: string;
  name: string;
  pricingMode: 'PER_SET';
  sortOrder: number;
  variants: ServiceVariantResponse[];
}

// ── Transform new → old shape ─────────────────────────────────────────────────

function formatRimLabel(rimSizes: string[]): string {
  if (rimSizes.length === 0) return '';
  const first = rimSizes[0]!;
  const last = rimSizes[rimSizes.length - 1]!;
  return rimSizes.length === 1 ? first : `${first}–${last}`;
}

function transformToGroup(service: RawService): ServiceGroupResponse {
  let variants: ServiceVariantResponse[];

  if (service.pricingType === 'RIM_SIZES') {
    // One virtual variant with all the rim tiers inside
    variants = [
      {
        id: service.id,
        name: service.name,
        enabled: true,
        sortOrder: 0,
        rimTiers: service.variants.map((v: RawVariant, i) => ({
          rimSizes: v.rimSizes,
          pricePln: v.pricePln,
          durationMinutes: v.durationMinutes,
          sortOrder: i,
        })),
        subServices: [],
      },
    ];
  } else if (service.pricingType === 'VARIANTS') {
    // Each variant becomes a variant with a single "virtual" rim tier
    variants = service.variants.map((v: RawVariant) => ({
      id: v.id,
      name: v.name ?? service.name,
      enabled: true,
      sortOrder: v.sortOrder,
      rimTiers: [
        {
          rimSizes: [],
          pricePln: v.pricePln,
          durationMinutes: v.durationMinutes,
          sortOrder: 0,
        },
      ],
      subServices: [],
    }));
  } else {
    // FLAT — single variant, single virtual rim tier
    const v = service.variants[0];
    variants = v
      ? [
          {
            id: service.id,
            name: service.name,
            enabled: true,
            sortOrder: 0,
            rimTiers: [
              {
                rimSizes: [],
                pricePln: v.pricePln,
                durationMinutes: v.durationMinutes,
                sortOrder: 0,
              },
            ],
            subServices: [],
          },
        ]
      : [];
  }

  return {
    id: service.id,
    name: service.name,
    pricingMode: 'PER_SET',
    sortOrder: service.sortOrder,
    variants,
  };
}

export const serviceGroupsApi = {
  list: async (): Promise<ServiceGroupResponse[]> => {
    const services = await api.get<RawService[]>('/v1/providers/me/services');
    return services.map(transformToGroup);
  },
  // stub — no longer applicable
  surcharges: async () => [] as never[],
  upsertGroups: async () => [] as ServiceGroupResponse[],
  upsertSurcharges: async () => [] as never[],
};

// Legacy type aliases
export type RimTierResponse = ServiceVariantResponse['rimTiers'][number];
export type UpsertServiceGroupsBody = Record<string, never>;
export type UpsertSurchargesBody = Record<string, never>;
export type SurchargeResponse = never;
