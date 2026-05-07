'use client';

import { useState } from 'react';
import { Text } from '@opony/design-system-web';
import { IconInfo } from '../../../../components/icons';
import type { ServiceState, AddonState } from '../_types';
import styles from './SimulationCard.module.css';

interface Props {
  services: ServiceState[];
  addons: AddonState[];
}

export function SimulationCard({ services, addons }: Props) {
  const [selectedId, setSelectedId] = useState<string>(() => services[0]?.id ?? '');

  const service = services.find((s) => s.id === selectedId) ?? services[0];
  const linkedAddons = service ? addons.filter((a) => service.addonIds.includes(a.id)) : [];

  const prices = service
    ? service.variants.map((v) => parseFloat(v.pricePln) || 0).filter((p) => p > 0)
    : [];
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;

  function getVariantLabel(v: ServiceState['variants'][number], i: number): string {
    if (service?.pricingType === 'RIM_SIZES') {
      return v.rimSizes.length ? v.rimSizes.join(', ') : `Tier ${i + 1}`;
    }
    return v.name ?? `Wariant ${i + 1}`;
  }

  return (
    <div className={styles.card}>
      <div className={styles.hdr}>
        <IconInfo width="10" height="10" style={{ color: 'var(--text-muted)' }} />
        <Text variant="nano" as="span" weight="bold" color="secondary">
          Symulacja cennika
        </Text>
      </div>

      {services.length === 0 ? (
        <div className={styles.body}>
          <div className={styles.emptyHint}>
            <Text variant="nano" as="p" color="secondary">
              Dodaj usługę, żeby zobaczyć podgląd cennika.
            </Text>
          </div>
        </div>
      ) : (
        <>
          {services.length > 1 && (
            <div className={styles.tabs}>
              {services.map((s) => (
                <button
                  key={s.id}
                  className={`${styles.tab} ${s.id === service?.id ? styles.tabActive : ''}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <Text variant="nano" as="span">
                    {s.name}
                  </Text>
                </button>
              ))}
            </div>
          )}

          <div className={styles.body}>
            {minPrice !== null && (
              <div className={styles.total}>
                <Text variant="nano" as="span" color="secondary">
                  {service!.name}
                </Text>
                <Text variant="body-sm" as="span" weight="bold">
                  {minPrice === maxPrice ? `${minPrice} zł` : `od ${minPrice} zł`}
                </Text>
              </div>
            )}

            {service && service.variants.length > 0 && (
              <>
                {minPrice !== null && <div className={styles.divider} />}
                {service.variants.map((v, i) => {
                  const price = parseFloat(v.pricePln) || 0;
                  const dur = parseInt(v.durationMinutes) || 0;
                  return (
                    <div key={v.id} className={`${styles.row} ${styles.rowBase}`}>
                      <div className={styles.rowLabel}>
                        <Text variant="nano" as="span">
                          {getVariantLabel(v, i)}
                        </Text>
                      </div>
                      <div className={styles.rowMeta}>
                        {dur > 0 && (
                          <Text variant="nano" as="span" color="secondary" mono>
                            {dur} min
                          </Text>
                        )}
                        {price > 0 && (
                          <Text variant="nano" as="span" weight="bold">
                            {price} zł
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {service && service.variants.length === 0 && (
              <div className={styles.emptyHint}>
                <Text variant="nano" as="p" color="secondary">
                  Dodaj warianty cenowe, żeby zobaczyć podgląd.
                </Text>
              </div>
            )}

            {linkedAddons.length > 0 && (
              <>
                <div className={styles.divider} />
                {linkedAddons.map((addon) => {
                  const price = parseFloat(addon.pricePln) || 0;
                  return (
                    <div key={addon.id} className={`${styles.row} ${styles.rowOpt}`}>
                      <Text variant="nano" as="span">
                        {addon.name || 'Dodatek'}
                      </Text>
                      {price > 0 && (
                        <Text variant="nano" as="span" weight="bold">
                          +{price} zł
                        </Text>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
