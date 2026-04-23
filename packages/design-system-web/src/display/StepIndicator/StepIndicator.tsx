import React from 'react';
import styles from './StepIndicator.module.css';

export type StepStatus = 'done' | 'active' | 'upcoming';

export interface Step {
  label: string;
  status: StepStatus;
}

export interface StepIndicatorProps {
  steps: Step[];
  className?: string;
}

const CheckIcon = () => (
  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
    <path
      d="M1 5l3.5 3.5L11 1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <ol className={[styles.root, className].filter(Boolean).join(' ')} aria-label="Progress">
      {steps.map((step, i) => (
        <li key={i} className={[styles.step, styles[step.status]].join(' ')}>
          <span
            className={styles.circle}
            aria-label={
              step.status === 'done'
                ? 'Completed'
                : step.status === 'active'
                  ? 'Current step'
                  : 'Upcoming'
            }
          >
            {step.status === 'done' ? (
              <CheckIcon />
            ) : (
              <span className={styles.number} aria-hidden="true">
                {i + 1}
              </span>
            )}
          </span>
          {i < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
          <span className={styles.label}>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
