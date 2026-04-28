import { Text } from '@opony/design-system-web';
import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { rimLabel } from './utils';
import styles from '../pricing.module.css';

interface Props {
  drafts: TierDraft[];
}

export function PricingPreview({ drafts }: Props) {
  const firstBalancing = drafts.find((d) => d.balancingEnabled);

  return (
    <aside className={styles.previewCol}>
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <span className={styles.previewTitle}>Podgląd dla klienta</span>
          <Text variant="nano" as="span" className={styles.previewLiveBadge}>
            <span className={styles.previewLiveDot} />
            Live
          </Text>
        </div>

        {drafts.length === 0 ? (
          <p className={styles.previewEmpty}>Brak tierów — dodaj pierwszy przedział</p>
        ) : (
          <div className={styles.previewTable}>
            {drafts.map((d, idx) => (
              <div key={d.id ?? idx} className={styles.previewTierRow}>
                <span className={styles.previewTierName}>
                  {rimLabel(d.rimSizeMin, d.rimSizeMax)}
                </span>
                <span className={styles.previewTierPrice}>{d.priceSwapPln} zł</span>
              </div>
            ))}
          </div>
        )}

        {firstBalancing && (
          <div className={styles.previewExtras}>
            <span>Wyważanie</span>
            <span className={styles.previewExtrasVal}>
              +{firstBalancing.priceBalancingPerWheelPln} zł/koło
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
