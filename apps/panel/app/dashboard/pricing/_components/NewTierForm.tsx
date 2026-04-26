import { Input, Button } from '@opony/design-system-web';
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
        <Input
          type="number"
          min={10}
          max={24}
          value={newTier.rimSizeMin}
          onChange={(e) => setNewTier((p) => ({ ...p, rimSizeMin: Number(e.target.value) }))}
          aria-label="Rozmiar felgi od"
          className={styles.rimInputDs}
        />
        <span className={styles.rimSep}>–</span>
        <Input
          type="number"
          min={10}
          max={24}
          value={newTier.rimSizeMax}
          onChange={(e) => setNewTier((p) => ({ ...p, rimSizeMax: Number(e.target.value) }))}
          aria-label="Rozmiar felgi do"
          className={styles.rimInputDs}
        />
        <span className={styles.rimUnit}>cali</span>
      </div>

      <Input
        type="number"
        min={1}
        step={1}
        value={newTier.priceSwapPln || ''}
        placeholder="0"
        suffix={<span>zł</span>}
        onChange={(e) => setNewTier((p) => ({ ...p, priceSwapPln: Number(e.target.value) }))}
        aria-label="Cena wymiany"
        className={styles.priceInputDs}
      />

      <Button variant="ghost" size="sm" onClick={onCancel}>
        Anuluj
      </Button>
    </div>
  );
}
