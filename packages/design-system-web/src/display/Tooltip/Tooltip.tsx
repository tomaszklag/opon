import React from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className={styles.wrap}>
      {children}
      <span className={styles.tip} role="tooltip">
        {content}
      </span>
    </span>
  );
}
