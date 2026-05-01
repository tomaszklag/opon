import React from 'react';
import styles from './FieldLabel.module.css';

interface Props {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FieldLabel({ htmlFor, required, children }: Props) {
  return (
    <label className={styles.label} htmlFor={htmlFor}>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
