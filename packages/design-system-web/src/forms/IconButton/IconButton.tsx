'use client';
import React from 'react';
import styles from './IconButton.module.css';

export type IconButtonSize = 'xs' | 'sm';
export type IconButtonVariant = 'default' | 'danger';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  'aria-label': string;
}

const sizeClass: Record<IconButtonSize, string> = {
  xs: styles.xs as string,
  sm: styles.sm as string,
};

export function IconButton({
  size = 'sm',
  variant = 'default',
  className,
  children,
  ...props
}: IconButtonProps) {
  const cls = [
    styles.iconButton as string,
    sizeClass[size],
    variant === 'danger' ? (styles.danger as string) : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}
