import { Heading, Text, PricingTable, type PricingRow } from '@opony/design-system-web';
import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { rimLabel } from './utils';
import styles from '../pricing.module.css';

interface Props {
  drafts: TierDraft[];
  globalBalancingEnabled: boolean;
  globalBalancingPrice: number;
}

export function PricingPreview({ drafts, globalBalancingEnabled, globalBalancingPrice }: Props) {
  const rows: PricingRow[] = drafts.map((d, i) => ({
    id: d.id ?? `draft-${i}`,
    size: rimLabel(d.rimSizeMin, d.rimSizeMax),
    price: `${d.priceSwapPln} zł`,
    highlighted: d.rimSizeMin >= 16 && d.rimSizeMax <= 17,
    highlightLabel: 'Twoje opony',
  }));

  const minPrice = drafts.length > 0 ? Math.min(...drafts.map((d) => d.priceSwapPln)) : null;

  return (
    <aside className={styles.previewCol}>
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="section" as="span">
            Podgląd dla klienta
          </Heading>
          <Text variant="nano" as="span" color="secondary" className={styles.previewLiveBadge}>
            <span className={styles.previewLiveDot} />
            Live
          </Text>
        </div>

        <div className={styles.previewDevice}>
          <div className={styles.previewChrome}>app.opony.app · Karta punktu</div>
          <div className={styles.previewContent}>
            <div className={styles.previewProviderCard}>
              <div className={styles.previewAvatar}>MK</div>
              <div>
                <Text variant="body-sm" as="p" weight="bold">
                  MobilOpony Kasia
                </Text>
                <Text variant="nano" as="p" color="secondary">
                  Z dojazdem ·{' '}
                  <Text variant="nano" as="span" color="accent" mono>
                    {minPrice !== null ? `od ${minPrice} zł` : '—'}
                  </Text>{' '}
                  · ⭐ 4,8
                </Text>
              </div>
            </div>

            {drafts.length === 0 ? (
              <Text variant="body-sm" as="p" color="muted" className={styles.previewEmpty}>
                Brak tierów — dodaj pierwszy przedział
              </Text>
            ) : (
              <>
                <Text
                  variant="nano"
                  as="p"
                  weight="extrabold"
                  color="secondary"
                  className={styles.previewSectionLabel}
                >
                  Cennik
                </Text>
                <PricingTable
                  rows={rows}
                  surcharge={
                    globalBalancingEnabled
                      ? {
                          label: 'Wyważanie (opcjonalnie)',
                          value: `${globalBalancingPrice} zł / koło`,
                        }
                      : undefined
                  }
                />
              </>
            )}

            <Text variant="nano" as="p" color="muted" className={styles.previewFoot}>
              Zmiany widoczne na stronie kilka sekund po zapisaniu.
            </Text>
          </div>
        </div>

        <Text variant="nano" as="p" color="muted" className={styles.previewCaption}>
          Klient widzi{' '}
          <Text variant="nano" as="span" color="accent" weight="bold">
            Twoje opony
          </Text>{' '}
          podświetlone — tier odpowiadający rozmiarowi z jego profilu pojazdu.
        </Text>
      </div>
    </aside>
  );
}
