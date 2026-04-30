'use client';
import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'neutral-danger'
  | 'link'
  | 'cta'
  | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: styles.primary as string,
  secondary: styles.secondary as string,
  ghost: styles.ghost as string,
  danger: styles.danger as string,
  'neutral-danger': styles.neutralDanger as string,
  link: styles.link as string,
  cta: styles.cta as string,
  neutral: styles.neutral as string,
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconOnly = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const cls = [
    styles.button,
    VARIANT_CLASS[variant],
    styles[size],
    fullWidth ? styles.fullWidth : null,
    iconOnly ? styles.iconOnly : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;
  return (
    <button
      className={cls}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className={styles.spinner}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="56.5"
            strokeDashoffset="42"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
