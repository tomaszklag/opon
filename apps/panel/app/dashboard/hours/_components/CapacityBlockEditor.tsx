import { Button, IconButton, Text } from '@opony/design-system-web';
import { type CapacityBlock } from '../../../../lib/hooks/use-working-hours';
import { IconMinus, IconPlus, IconTrash } from '../../../../components/icons';
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
        Każdy blok ma własną liczbę stanowisk — np. 2 rano, 1 po południu.
      </Text>

      {blocks.map((block, i) => {
        const blockSlots = computeSlots(block.from, block.to, slotMinutes) * block.workstations;
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
            <div className={styles.blockStepper}>
              <IconButton
                size="xs"
                aria-label="Zmniejsz liczbę stanowisk"
                onClick={() =>
                  onUpdateBlock(i, { workstations: Math.max(1, block.workstations - 1) })
                }
                disabled={block.workstations <= 1}
              >
                <IconMinus width="10" height="10" />
              </IconButton>
              <Text variant="nano" as="span" className={styles.workstationValue}>
                {block.workstations}
              </Text>
              <Text variant="nano" as="span" color="muted">
                st.
              </Text>
              <IconButton
                size="xs"
                aria-label="Zwiększ liczbę stanowisk"
                onClick={() =>
                  onUpdateBlock(i, { workstations: Math.min(10, block.workstations + 1) })
                }
                disabled={block.workstations >= 10}
              >
                <IconPlus width="10" height="10" />
              </IconButton>
            </div>
            <Text variant="nano" as="span" color="muted" className={styles.blockSlotInfo}>
              {blockSlots} rez.
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
