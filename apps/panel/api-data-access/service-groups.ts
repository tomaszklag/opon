// Compatibility shim — transforms new Services API to old ManualBookingModal shape
import { api } from '../lib/api';
import type { components } from '@opony/api-client';

type RawService = components['schemas']['ServiceResponseDto'];
type RawVariant = components['schemas']['ServiceVariantResponseDto'];
type RawAddon = components['schemas']['AddonResponseDto'];

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

// ── Build sub-services list for a service ────────────────────────────────────

function buildSubServices(
  service: RawService,
  allServices: RawService[],
  allAddons: RawAddon[],
): SubServiceResponse[] {
  // Sub-service IDs point to other Service records — always included in the price
  const subSvcs: SubServiceResponse[] = service.subServiceIds.flatMap((id, i) => {
    const sub = allServices.find((s) => s.id === id && s.enabled);
    if (!sub) return [];
    const firstVariant = sub.variants[0];
    return [
      {
        id: sub.id,
        name: sub.name,
        included: false,
        enabled: true,
        fromCatalog: true,
        pricePln: firstVariant ? Number(firstVariant.pricePln) : null,
        durationMinutes: firstVariant?.durationMinutes ?? null,
        sortOrder: i,
      },
    ];
  });

  // Addon IDs point to Addon records — optional extras
  const addons: SubServiceResponse[] = service.addonIds.flatMap((id, i) => {
    const addon = allAddons.find((a) => a.id === id && a.enabled);
    if (!addon) return [];
    return [
      {
        id: addon.id,
        name: addon.name,
        included: false,
        enabled: true,
        fromCatalog: true,
        pricePln: addon.pricePln,
        durationMinutes: addon.durationMinutes ?? null,
        sortOrder: 100 + i,
      },
    ];
  });

  return [...subSvcs, ...addons];
}

// ── Transform new → old shape ─────────────────────────────────────────────────

function formatRimLabel(rimSizes: string[]): string {
  if (rimSizes.length === 0) return '';
  const first = rimSizes[0]!;
  const last = rimSizes[rimSizes.length - 1]!;
  return rimSizes.length === 1 ? first : `${first}–${last}`;
}

function transformToGroup(
  service: RawService,
  allServices: RawService[],
  allAddons: RawAddon[],
): ServiceGroupResponse {
  const subServices = buildSubServices(service, allServices, allAddons);
  let variants: ServiceVariantResponse[];

  if (service.pricingType === 'RIM_SIZES') {
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
        subServices,
      },
    ];
  } else if (service.pricingType === 'VARIANTS') {
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
      subServices,
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
            subServices,
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
    const [services, addons] = await Promise.all([
      api.get<RawService[]>('/v1/providers/me/services'),
      api.get<RawAddon[]>('/v1/providers/me/addons'),
    ]);
    return services.filter((s) => s.enabled).map((s) => transformToGroup(s, services, addons));
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
