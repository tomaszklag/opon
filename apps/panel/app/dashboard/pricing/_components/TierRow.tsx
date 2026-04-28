import { Input, Button, Text } from '@opony/design-system-web';
import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { type MarketPrice } from '../../../../lib/hooks/use-market-prices';
import { IconTrash } from '../../../../components/icons';
import { rimLabel } from './utils';
import styles from '../pricing.module.css';

interface Props {
  draft: TierDraft;
  idx: number;
  popular?: boolean;
  description?: string;
  marketRef?: MarketPrice;
  onUpdate: (idx: number, patch: Partial<TierDraft>) => void;
  onDelete: (idx: number) => void;
}

function priceDelta(price: number, ref: MarketPrice): 'low' | 'ok' | 'high' {
  if (price <= ref.priceMin) return 'low';
  if (price > ref.priceMax) return 'high';
  return 'ok';
}

export function TierRow({
  draft: d,
  idx,
  popular,
  description,
  marketRef,
  onUpdate,
  onDelete,
}: Props) {
  const delta = marketRef ? priceDelta(d.priceSwapPln, marketRef) : null;

  return (
    <div
      className={[styles.tierRow, popular ? styles.tierRowPopular : ''].filter(Boolean).join(' ')}
    >
      <div className={styles.tierInfo}>
        <div className={styles.tierNameRow}>
          <Text variant="label" as="span" weight="bold" className={styles.tierName}>
            {rimLabel(d.rimSizeMin, d.rimSizeMax)}
          </Text>
          {popular && <span className={styles.popularBadge}>Najpopularniejsze · 68%</span>}
        </div>
        {description && (
          <Text variant="nano" as="span" color="muted">
            {description}
          </Text>
        )}
        {marketRef && (
          <div className={styles.marketRef}>
            <Text variant="nano" as="span" color="muted">
              rynek: {marketRef.priceMin}–{marketRef.priceMax} zł
            </Text>
            {delta === 'low' && (
              <Text variant="nano" as="span" className={styles.deltaLow}>
                · niższa
              </Text>
            )}
            {delta === 'high' && (
              <Text variant="nano" as="span" className={styles.deltaHigh}>
                · powyżej rynku
              </Text>
            )}
          </div>
        )}
      </div>

      <Input
        type="number"
        min={1}
        step={1}
        value={d.priceSwapPln}
        suffix={<span>zł</span>}
        onChange={(e) => onUpdate(idx, { priceSwapPln: Number(e.target.value) })}
        aria-label={`Cena wymiany ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
        className={styles.priceInputNum}
      />

      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={() => onDelete(idx)}
        aria-label={`Usuń tier ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
      >
        <IconTrash width="13" height="13" />
      </Button>
    </div>
  );
}
