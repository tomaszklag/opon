'use client';
import React, { useId } from 'react';
import styles from './NumberStepper.module.css';

export interface NumberStepperProps {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  /** px width of the text input portion, default 52 */
  inputWidth?: number;
  disabled?: boolean;
  error?: boolean;
  'aria-label'?: string;
  id?: string;
}

export function NumberStepper({
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  inputWidth = 52,
  disabled = false,
  error = false,
  'aria-label': ariaLabel,
  id,
}: NumberStepperProps) {
  const uid = useId();
  const inputId = id ?? uid;

  const numeric = parseFloat(value);
  const canDecrement = !disabled && (min === undefined || isNaN(numeric) || numeric - step >= min);
  const canIncrement = !disabled && (max === undefined || isNaN(numeric) || numeric + step <= max);

  function decrement() {
    const next = isNaN(numeric) ? (min ?? 0) : numeric - step;
    if (min !== undefined && next < min) return;
    onChange(String(next));
  }

  function increment() {
    const next = isNaN(numeric) ? (min ?? 0) + step : numeric + step;
    if (max !== undefined && next > max) return;
    onChange(String(next));
  }

  const wrapClass = [styles.wrap, error ? styles.error : ''].filter(Boolean).join(' ');

  return (
    <div
      className={wrapClass}
      style={{ '--stepper-width': `${inputWidth}px` } as React.CSSProperties}
    >
      <input
        id={inputId}
        type="number"
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
      />

      {unit && <span className={styles.unit}>{unit}</span>}

      <div className={styles.stepBtns}>
        <button
          type="button"
          className={styles.stepBtn}
          onClick={decrement}
          disabled={!canDecrement}
          tabIndex={-1}
          aria-label={`Zmniejsz ${ariaLabel ?? ''}`}
        >
          −
        </button>
        <button
          type="button"
          className={styles.stepBtn}
          onClick={increment}
          disabled={!canIncrement}
          tabIndex={-1}
          aria-label={`Zwiększ ${ariaLabel ?? ''}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
