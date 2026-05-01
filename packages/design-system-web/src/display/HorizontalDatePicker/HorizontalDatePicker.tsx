'use client';
import React from 'react';
import styles from './HorizontalDatePicker.module.css';

export interface DateChip {
  date: string;
  dayOfWeek: string;
  dayNum: number | string;
  available?: boolean;
  weekend?: boolean;
}

export interface HorizontalDatePickerProps {
  chips: DateChip[];
  selected?: string;
  onSelect: (date: string) => void;
  className?: string;
}

export function HorizontalDatePicker({
  chips,
  selected,
  onSelect,
  className,
}: HorizontalDatePickerProps) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(' ')}
      role="listbox"
      aria-label="Wybierz datę"
    >
      {chips.map((chip) => {
        const isSelected = chip.date === selected;
        const isUnavailable = !chip.available;
        const cls = [
          styles.chip,
          isSelected ? styles.selected : null,
          isUnavailable ? styles.unavailable : null,
          chip.weekend && !isSelected ? styles.weekend : null,
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={chip.date}
            role="option"
            aria-selected={isSelected}
            aria-disabled={isUnavailable}
            disabled={isUnavailable}
            className={cls}
            onClick={() => onSelect(chip.date)}
            type="button"
          >
            <span className={styles.dow}>{chip.dayOfWeek}</span>
            <span className={styles.num}>{chip.dayNum}</span>
            <span className={styles.dot} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
