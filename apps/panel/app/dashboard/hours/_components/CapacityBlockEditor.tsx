import { Button, IconButton, Text } from '@opony/design-system-web';
import { type CapacityBlock } from '../../../../lib/hooks/use-working-hours';
import { IconPlus, IconTrash } from '../../../../components/icons';
import { computeSlots } from './utils';
import styles from '../hours.module.css';

interface Props {
  blocks: CapacityBlock[];
  slotMinutes: number;
  onUpdateBlock: (index: number, patch: Partial<CapacityBlock>) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
}

export function CapacityBlockEditor({
  blocks,
  slotMinutes,
  onUpdateBlock,
  onAddBlock,
  onRemoveBlock,
}: Props) {
  return (
    <div className={styles.blockEditorWrap}>
      <Text variant="nano" as="p" color="muted" className={styles.blockEditorHint}>
        Podziel na bloki (np. przerwa obiadowa). Capacity wynika ze Stanowisk.
      </Text>

      {blocks.map((block, i) => {
        const blockSlots = computeSlots(block.from, block.to, slotMinutes);
        return (
          <div key={i} className={styles.blockRow}>
            <label className={styles.timeInput}>
              <Text variant="nano" as="span" color="muted">
                Od
              </Text>
              <input
                type="time"
                value={block.from}
                onChange={(e) => onUpdateBlock(i, { from: e.target.value })}
              />
            </label>
            <label className={styles.timeInput}>
              <Text variant="nano" as="span" color="muted">
                Do
              </Text>
              <input
                type="time"
                value={block.to}
                onChange={(e) => onUpdateBlock(i, { to: e.target.value })}
              />
            </label>
            <Text variant="nano" as="span" color="muted" className={styles.blockSlotInfo}>
              {blockSlots} sl.
            </Text>
            <IconButton
              size="xs"
              aria-label={`Usuń blok ${i + 1}`}
              onClick={() => onRemoveBlock(i)}
            >
              <IconTrash width="10" height="10" />
            </IconButton>
          </div>
        );
      })}

      {blocks.length < 3 && (
        <Button variant="ghost" size="sm" onClick={onAddBlock} className={styles.addBlockBtn}>
          <IconPlus width="12" height="12" />
          Dodaj blok
        </Button>
      )}
    </div>
  );
}
