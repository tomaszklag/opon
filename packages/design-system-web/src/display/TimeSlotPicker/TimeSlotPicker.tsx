'use client';
import React from 'react';
import styles from './TimeSlotPicker.module.css';

export type SlotState = 'free' | 'selected' | 'taken';

export interface TimeSlot {
  id: string;
  time: string;
  state: SlotState;
}

export interface SlotGroup {
  label: string;
  slots: TimeSlot[];
}

export interface TimeSlotPickerProps {
  groups: SlotGroup[];
  onSelect: (slotId: string) => void;
  className?: string;
}

export function TimeSlotPicker({ groups, onSelect, className }: TimeSlotPickerProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          <div className={styles.groupHead}>
            <span className={styles.groupLabel}>{group.label}</span>
            <span className={styles.groupCount}>
              ({group.slots.filter((s) => s.state === 'free').length} wolnych)
            </span>
            <span className={styles.groupLine} aria-hidden="true" />
          </div>
          <div className={styles.grid} role="listbox" aria-label={`Sloty ${group.label}`}>
            {group.slots.map((slot) => {
              const isTaken = slot.state === 'taken';
              const isSelected = slot.state === 'selected';
              return (
                <button
                  key={slot.id}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isTaken}
                  disabled={isTaken}
                  type="button"
                  className={[
                    styles.slot,
                    isSelected ? styles.selected : null,
                    isTaken ? styles.taken : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => !isTaken && onSelect(slot.id)}
                >
                  {slot.time}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
