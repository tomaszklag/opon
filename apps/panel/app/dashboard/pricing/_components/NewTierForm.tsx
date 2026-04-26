import { type TierDraft } from '../../../../lib/hooks/use-pricing-tiers';
import styles from '../pricing.module.css';

interface Props {
  newTier: TierDraft;
  setNewTier: React.Dispatch<React.SetStateAction<TierDraft>>;
  onCancel: () => void;
}

export function NewTierForm({ newTier, setNewTier, onCancel }: Props) {
  return (
    <div className={[styles.tierRow, styles.tierRowNew].join(' ')}>
      <div className={styles.rimRangeInputs}>
        <span className={styles.rimLabel}>Felga</span>
        <input
          className={styles.rimInput}
          type="number"
          min={10}
          max={24}
          value={newTier.rimSizeMin}
          onChange={(e) => setNewTier((p) => ({ ...p, rimSizeMin: Number(e.target.value) }))}
          aria-label="Rozmiar felgi od"
        />
        <span className={styles.rimSep}>–</span>
        <input
          className={styles.rimInput}
          type="number"
          min={10}
          max={24}
          value={newTier.rimSizeMax}
          onChange={(e) => setNewTier((p) => ({ ...p, rimSizeMax: Number(e.target.value) }))}
          aria-label="Rozmiar felgi do"
        />
        <span className={styles.rimUnit}>cali</span>
      </div>

      <label className={styles.priceInput}>
        <input
          type="number"
          min={1}
          step={1}
          value={newTier.priceSwapPln || ''}
          placeholder="0"
          onChange={(e) => setNewTier((p) => ({ ...p, priceSwapPln: Number(e.target.value) }))}
          aria-label="Cena wymiany"
        />
        <span className={styles.priceUnit}>zł</span>
      </label>

      <button className={styles.cancelBtn} onClick={onCancel}>
        Anuluj
      </button>
    </div>
  );
}
