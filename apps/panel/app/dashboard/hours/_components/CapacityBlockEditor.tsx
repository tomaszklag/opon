import { Button, IconButton, Text, TimeInput } from '@opony/design-system-web';
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
            <TimeInput
              label="Od"
              value={block.from}
              onChange={(v) => onUpdateBlock(i, { from: v })}
            />
            <TimeInput label="Do" value={block.to} onChange={(v) => onUpdateBlock(i, { to: v })} />
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
