import { useState } from 'react';
import { Text } from '@opony/design-system-web';
import type { DepotSlot } from '../../../../api-data-access/depot';
import styles from '../depot.module.css';

interface Props {
  slots: DepotSlot[];
  sections: string[];
  onSlotClick: (slot: DepotSlot) => void;
}

export function DepotMap({ slots, sections, onSlotClick }: Props) {
  const [activeSection, setActiveSection] = useState<string>(sections[0] ?? '');

  const sectionSlots = slots.filter((s) => s.section === activeSection);
  const rows = [...new Set(sectionSlots.map((s) => s.row))].sort((a, b) => a - b);
  const positions = [...new Set(sectionSlots.map((s) => s.position))].sort((a, b) => a - b);

  const occupied = sectionSlots.filter((s) => s.occupied).length;
  const total = sectionSlots.length;

  if (slots.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text variant="body-sm" as="p" color="secondary">
          Brak skonfigurowanych miejsc składu.
        </Text>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.mapControls}>
        <Text variant="nano" as="span" color="secondary">
          Sekcja:
        </Text>
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`${styles.tab} ${activeSection === s ? styles.tabActive : ''}`}
            style={{ padding: '4px 12px' }}
          >
            {s}
          </button>
        ))}
        {activeSection && (
          <Text variant="nano" as="span" color="secondary">
            Zajęte: {occupied}/{total}
          </Text>
        )}
      </div>

      <div className={styles.mapGrid}>
        {rows.map((row) => (
          <div key={row} className={styles.mapRow}>
            <Text variant="nano" as="span" className={styles.mapRowLabel} color="secondary">
              R{row}
            </Text>
            {positions.map((pos) => {
              const slot = sectionSlots.find((s) => s.row === row && s.position === pos);
              if (!slot) {
                return <div key={pos} className={styles.mapSlot} style={{ opacity: 0.2 }} />;
              }
              return (
                <button
                  key={pos}
                  className={`${styles.mapSlot} ${slot.occupied ? styles.mapSlotOccupied : ''}`}
                  onClick={() => onSlotClick(slot)}
                  title={slot.occupied ? (slot.tireSetClientName ?? '') : 'Wolne'}
                >
                  <Text variant="nano" as="span" color="secondary" className={styles.mapSlotLabel}>
                    {activeSection}
                    {row}-{pos}
                  </Text>
                  {slot.occupied && slot.tireSetClientName && (
                    <Text
                      variant="nano"
                      as="span"
                      weight="bold"
                      color="accent"
                      className={styles.mapSlotName}
                    >
                      {slot.tireSetClientName.split(' ')[0]}
                    </Text>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
