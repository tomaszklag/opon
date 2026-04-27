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

export function StepIndicator({ steps, className }: StepIndicatorProps) {
  const activeIndex = steps.findIndex((s) => s.status === 'active');
  const currentStep =
    activeIndex >= 0 ? activeIndex + 1 : steps.filter((s) => s.status === 'done').length + 1;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="progressbar"
      aria-label="Postęp"
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={currentStep}
    >
      {steps.flatMap((step, i) => {
        const stepClass = [styles.step, styles[step.status]].filter(Boolean).join(' ');
        const elements: React.ReactNode[] = [];

        if (i > 0) {
          elements.push(
            <span
              key={`c-${i}`}
              className={`${styles.connector} ${steps[i - 1]?.status === 'done' ? styles.connectorDone : ''}`}
            />,
          );
        }

        elements.push(
          <div key={i} className={stepClass}>
            <span className={styles.circle}>{i + 1}</span>
            <span className={styles.label}>{step.label}</span>
          </div>,
        );

        return elements;
      })}
    </div>
  );
}
