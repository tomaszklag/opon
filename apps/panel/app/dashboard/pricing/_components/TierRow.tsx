import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import { IconTrash } from '../../../../components/icons';
import { rimLabel } from './utils';
import styles from '../pricing.module.css';

interface Props {
  draft: TierDraft;
  idx: number;
  onUpdate: (idx: number, patch: Partial<TierDraft>) => void;
  onDelete: (idx: number) => void;
}

export function TierRow({ draft: d, idx, onUpdate, onDelete }: Props) {
  return (
    <div className={styles.tierRow}>
      <div className={styles.tierInfo}>
        <span className={styles.tierName}>{rimLabel(d.rimSizeMin, d.rimSizeMax)}</span>
      </div>

      <label className={styles.priceInput}>
        <input
          type="number"
          min={1}
          step={1}
          value={d.priceSwapPln}
          onChange={(e) => onUpdate(idx, { priceSwapPln: Number(e.target.value) })}
          aria-label={`Cena wymiany ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
        />
        <span className={styles.priceUnit}>zł</span>
      </label>

      <div className={styles.balancingWrap}>
        <button
          className={[styles.toggleSmall, d.balancingEnabled ? styles.toggleSmallOn : ''].join(' ')}
          role="switch"
          aria-checked={d.balancingEnabled}
          aria-label="Wyważanie"
          onClick={() => onUpdate(idx, { balancingEnabled: !d.balancingEnabled })}
        />
        <span className={styles.balancingLabel}>Wyważanie</span>
        {d.balancingEnabled && (
          <label className={[styles.priceInput, styles.priceInputSm].join(' ')}>
            <input
              type="number"
              min={0}
              step={1}
              value={d.priceBalancingPerWheelPln}
              onChange={(e) => onUpdate(idx, { priceBalancingPerWheelPln: Number(e.target.value) })}
              aria-label="Cena wyważania"
            />
            <span className={styles.priceUnit}>zł/koło</span>
          </label>
        )}
      </div>

      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(idx)}
        aria-label={`Usuń tier ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
      >
        <IconTrash width="13" height="13" />
      </button>
    </div>
  );
}
