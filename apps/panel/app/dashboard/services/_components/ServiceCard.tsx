'use client';

import { Text } from '@opony/design-system-web';
import { IconServices } from '../../../../components/icons';
import { AccordionCard } from './AccordionCard';
import { ServiceVariantExpanded } from './ServiceVariantExpanded';
import type { ServiceState, AddonState } from '../_types';

const TYPE_LABEL: Record<string, string> = {
  FLAT: 'stała cena',
  VARIANTS: 'warianty',
  RIM_SIZES: 'rozmiary felg',
};

interface Props {
  service: ServiceState;
  allServices: ServiceState[];
  allAddons: AddonState[];
  onChange: (updated: ServiceState) => void;
  onDelete: () => void;
  onToggle: () => void;
  defaultOpen?: boolean;
}

export function ServiceCard({
  service,
  allServices,
  allAddons,
  onChange,
  onDelete,
  onToggle,
  defaultOpen,
}: Props) {
  const prices = service.variants.map((v) => parseFloat(v.pricePln) || 0).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const priceLabel =
    minPrice !== null
      ? minPrice === maxPrice
        ? `${minPrice} zł`
        : `${minPrice}–${maxPrice} zł`
      : '—';

  return (
    <AccordionCard
      label={service.name}
      icon={<IconServices width="11" height="11" style={{ color: 'var(--accent)' }} />}
      badge={
        <Text variant="nano" as="span" color="secondary">
          {TYPE_LABEL[service.pricingType] ?? service.pricingType}
        </Text>
      }
      meta={
        <Text variant="nano" as="span" mono color="secondary">
          {priceLabel}
        </Text>
      }
      enabled={service.enabled}
      onToggle={onToggle}
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel={`Usuń usługę ${service.name}`}
    >
      <ServiceVariantExpanded
        service={service}
        allServices={allServices}
        allAddons={allAddons}
        onChange={onChange}
      />
    </AccordionCard>
  );
}
