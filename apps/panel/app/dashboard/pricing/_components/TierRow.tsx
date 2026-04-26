import { Input, Toggle, Button } from '@opony/design-system-web';
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

      <Input
        type="number"
        min={1}
        step={1}
        value={d.priceSwapPln}
        suffix={<span>zł</span>}
        onChange={(e) => onUpdate(idx, { priceSwapPln: Number(e.target.value) })}
        aria-label={`Cena wymiany ${rimLabel(d.rimSizeMin, d.rimSizeMax)}`}
        className={styles.priceInputDs}
      />

      <div className={styles.balancingWrap}>
        <Toggle
          size="sm"
          checked={d.balancingEnabled}
          onChange={() => onUpdate(idx, { balancingEnabled: !d.balancingEnabled })}
          label="Wyważanie"
        />
        {d.balancingEnabled && (
          <Input
            type="number"
            min={0}
            step={1}
            value={d.priceBalancingPerWheelPln}
            suffix={<span>zł/koło</span>}
            onChange={(e) => onUpdate(idx, { priceBalancingPerWheelPln: Number(e.target.value) })}
            aria-label="Cena wyważania"
            className={styles.priceInputDs}
          />
        )}
      </div>

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
