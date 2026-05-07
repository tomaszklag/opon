export type ServicePricingType = 'FLAT' | 'VARIANTS' | 'RIM_SIZES';

export const RIM_SIZES = [
  'R13',
  'R14',
  'R15',
  'R16',
  'R17',
  'R18',
  'R19',
  'R20',
  'R21',
  'R22',
  'R23',
  'R24',
] as const;

export type RimSize = (typeof RIM_SIZES)[number];

export interface ServiceVariantState {
  id: string;
  name: string | null; // variant name for VARIANTS type; null for FLAT/RIM_SIZES
  rimSizes: string[]; // non-empty for RIM_SIZES type
  pricePln: string;
  durationMinutes: string;
  sortOrder: number;
}

export interface ServiceState {
  id: string;
  name: string;
  description: string | null;
  pricingType: ServicePricingType;
  enabled: boolean;
  sortOrder: number;
  variants: ServiceVariantState[];
  subServiceIds: string[];
  addonIds: string[];
}

export interface AddonState {
  id: string;
  name: string;
  pricePln: string;
  durationMinutes: string | null;
  enabled: boolean;
  sortOrder: number;
}

export interface ServicesPageState {
  services: ServiceState[];
  addons: AddonState[];
}
