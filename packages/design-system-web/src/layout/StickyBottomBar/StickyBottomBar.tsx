import React from 'react';
import styles from './StickyBottomBar.module.css';

export interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyBottomBar({ children, className }: StickyBottomBarProps) {
  return <div className={[styles.bar, className].filter(Boolean).join(' ')}>{children}</div>;
}
