export type PricingMode = 'PER_SET' | 'PER_WHEEL';

export interface RimTierState {
  id: string; // lokalny UUID (Math.random().toString())
  rimSizes: string[]; // ["R13","R14","R15"]
  pricePln: string; // string bo input
  durationMinutes: string;
  sortOrder: number;
}

export interface SubServiceState {
  id: string;
  name: string;
  included: boolean;
  enabled: boolean;
  fromCatalog: boolean;
  // null = inherit (domyślny tryb — kłódka zamknięta)
  pricePln: string | null;
  durationMinutes: string | null;
  sortOrder: number;
}

export interface ServiceVariantState {
  id: string;
  name: string;
  enabled: boolean;
  sortOrder: number;
  rimTiers: RimTierState[];
  subServices: SubServiceState[];
}

export interface ServiceGroupState {
  id: string;
  name: string;
  pricingMode: PricingMode;
  sortOrder: number;
  variants: ServiceVariantState[];
}

export interface SurchargeState {
  id: string;
  name: string;
  enabled: boolean;
  scope: 'PER_WHEEL' | 'PER_SENSOR';
  pricePln: string;
  sortOrder: number;
}

// Stan całej strony
export interface ServicesPageState {
  groups: ServiceGroupState[];
  surcharges: SurchargeState[];
}
