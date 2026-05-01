'use client';
import React from 'react';
import styles from './ContactRow.module.css';

export interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  cta?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function ContactRow({ icon, label, value, cta, href, onClick, className }: ContactRowProps) {
  const cls = [styles.row, className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={styles.iconBox} aria-hidden="true">
        {icon}
      </span>
      <div className={styles.col}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      {cta && <span className={styles.cta}>{cta}</span>}
    </>
  );

  if (href) {
    return (
      <a className={cls} href={href}>
        {content}
      </a>
    );
  }

  return (
    <div
      className={cls}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {content}
    </div>
  );
}
