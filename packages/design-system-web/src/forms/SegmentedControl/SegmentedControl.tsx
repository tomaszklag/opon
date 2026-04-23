'use client';
import React from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  name = 'segmented',
  fullWidth = false,
  className,
}: SegmentedControlProps) {
  return (
    <div
      className={[styles.root, fullWidth ? styles.fullWidth : null, className]
        .filter(Boolean)
        .join(' ')}
      role="radiogroup"
    >
      {options.map((opt) => (
        <label
          key={opt.value}
          className={[
            styles.option,
            opt.value === value ? styles.active : null,
            opt.disabled ? styles.disabled : null,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={opt.value === value}
            disabled={opt.disabled}
            onChange={() => onChange(opt.value)}
            className={styles.input}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}
