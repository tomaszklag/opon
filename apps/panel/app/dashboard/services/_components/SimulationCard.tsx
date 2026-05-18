'use client';

import { useState } from 'react';
import { Text, Combobox } from '@opony/design-system-web';
import { IconInfo } from '../../../../components/icons';
import { PriceTag } from './PriceTag';
import { DurBadge } from './DurBadge';
import type { ServiceState, AddonState } from '../_types';
import styles from './SimulationCard.module.css';

interface Props {
  services: ServiceState[];
  addons: AddonState[];
}

export function SimulationCard({ services, addons }: Props) {
  const [selectedId, setSelectedId] = useState<string>(() => services[0]?.id ?? '');

  const service = services.find((s) => s.id === selectedId) ?? services[0];

  const linkedSubServices = service
    ? service.subServiceIds
        .map((id) => services.find((s) => s.id === id))
        .filter((s): s is ServiceState => s !== undefined)
    : [];

  const linkedAddons = service
    ? service.addonIds
        .map((id) => addons.find((a) => a.id === id))
        .filter((a): a is AddonState => a !== undefined)
    : [];

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
            <div className={styles.selector}>
              <Combobox
                value={service?.id ?? ''}
                onChange={setSelectedId}
                options={services.map((s) => ({
                  value: s.id,
                  label: `${s.name || 'Usługa bez nazwy'}${!s.enabled ? ' (wył.)' : ''}`,
                }))}
                placeholder="Wybierz usługę…"
              />
            </div>
          )}

          <div className={styles.body}>
            {service && !service.enabled && (
              <div className={styles.disabledNotice}>
                <Text variant="nano" as="span" color="secondary">
                  Ta usługa jest wyłączona — niewidoczna dla klientów.
                </Text>
              </div>
            )}

            {minPrice !== null && (
              <div
                className={`${styles.total} ${service && !service.enabled ? styles.totalDisabled : ''}`}
              >
                <Text variant="nano" as="span" color="secondary">
                  {service!.name}
                </Text>
                <PriceTag value={minPrice} from={minPrice !== maxPrice} bold size="sm" />
              </div>
            )}

            {service && service.variants.length > 0 && (
              <>
                {minPrice !== null && <div className={styles.divider} />}
                {service.variants.map((v, i) => {
                  const price = parseFloat(v.pricePln) || 0;
                  const dur = parseInt(v.durationMinutes) || 0;
                  const wheelPrice = v.pricePerWheelPln
                    ? parseFloat(v.pricePerWheelPln)
                    : price
                      ? Math.round((price / 4) * 100) / 100
                      : 0;
                  const wheelDur = v.durationPerWheelMinutes
                    ? parseInt(v.durationPerWheelMinutes)
                    : dur
                      ? Math.round(dur / 4)
                      : 0;
                  return (
                    <div key={v.id} className={styles.variantGroup}>
                      <div className={`${styles.row} ${styles.rowBase}`}>
                        <div className={styles.rowLabel}>
                          <Text variant="nano" as="span">
                            {getVariantLabel(v, i)}
                          </Text>
                          {dur > 0 && <DurBadge minutes={dur} />}
                        </div>
                        {price > 0 && <PriceTag value={price} bold />}
                      </div>
                      {price > 0 && (
                        <div className={`${styles.row} ${styles.rowWheel}`}>
                          <div className={styles.rowLabel}>
                            <Text variant="nano" as="span" color="secondary">
                              1 koło
                            </Text>
                            {wheelDur > 0 && <DurBadge minutes={wheelDur} />}
                          </div>
                          <PriceTag value={wheelPrice} />
                        </div>
                      )}
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

            {linkedSubServices.length > 0 && (
              <>
                <div className={styles.divider} />
                <Text
                  variant="nano"
                  as="span"
                  color="secondary"
                  weight="bold"
                  className={styles.sectionLabel}
                >
                  Sugerowane
                </Text>
                {linkedSubServices.map((sub) => (
                  <div
                    key={sub.id}
                    className={`${styles.row} ${styles.rowSub} ${!sub.enabled ? styles.rowDisabled : ''}`}
                  >
                    <Text variant="nano" as="span" color={sub.enabled ? 'primary' : 'secondary'}>
                      {sub.name}
                    </Text>
                    {!sub.enabled && (
                      <Text variant="nano" as="span" color="secondary">
                        wył.
                      </Text>
                    )}
                  </div>
                ))}
              </>
            )}

            {linkedAddons.length > 0 && (
              <>
                <div className={styles.divider} />
                <Text
                  variant="nano"
                  as="span"
                  color="secondary"
                  weight="bold"
                  className={styles.sectionLabel}
                >
                  Dodatki
                </Text>
                {linkedAddons.map((addon) => {
                  const price = parseFloat(addon.pricePln) || 0;
                  return (
                    <div
                      key={addon.id}
                      className={`${styles.row} ${styles.rowOpt} ${!addon.enabled ? styles.rowDisabled : ''}`}
                    >
                      <Text
                        variant="nano"
                        as="span"
                        color={addon.enabled ? 'primary' : 'secondary'}
                      >
                        {addon.name || 'Dodatek'}
                      </Text>
                      {!addon.enabled ? (
                        <Text variant="nano" as="span" color="secondary">
                          wył.
                        </Text>
                      ) : price > 0 ? (
                        <PriceTag value={price} prefix="+" bold />
                      ) : null}
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
