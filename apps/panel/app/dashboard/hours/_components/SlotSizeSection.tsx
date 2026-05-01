import { Button, Heading, SegmentedControl, Text } from '@opony/design-system-web';
import { IconInfo, IconShield } from '../../../../components/icons';
import styles from '../hours.module.css';

const SLOT_OPTIONS = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
];

interface Props {
  defaultSlotMinutes: number;
  onUpdate: (minutes: number) => void;
  onApplyToAll: () => void;
}

export function SlotSizeSection({ defaultSlotMinutes, onUpdate, onApplyToAll }: Props) {
  return (
    <section className={styles.secCard}>
      <div className={styles.secHead}>
        <Heading variant="section" as="h2">
          Domyślna długość wizyty
        </Heading>
        <Text variant="nano" as="span" color="muted">
          Ustawiana dla nowych dni · możesz nadpisać indywidualnie w tabeli niżej
        </Text>
      </div>
      <div className={styles.slotSizeRow}>
        <Text variant="nano" as="span" color="muted" weight="extrabold">
          Standard:
        </Text>
        <SegmentedControl
          options={SLOT_OPTIONS}
          value={String(defaultSlotMinutes)}
          onChange={(v) => onUpdate(Number(v))}
          name="default-slot"
        />
        <Button variant="ghost" size="sm" onClick={onApplyToAll} style={{ marginLeft: 'auto' }}>
          <IconShield width="12" height="12" />
          Zastosuj do wszystkich dni
        </Button>
      </div>
      <Text variant="nano" as="p" color="accent" className={styles.slotInfoNote}>
        <IconInfo width="12" height="12" />
        Krótszy slot (30 min) w weekend to sposób na zmieszczenie więcej wizyt — sprawdzone przez
        warsztaty w Krakowie i Tarnowie.
      </Text>
    </section>
  );
}
