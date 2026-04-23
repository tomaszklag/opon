'use client';
import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  as?: React.ElementType;
}

export function Card({
  children,
  className,
  hoverable = false,
  onClick,
  as: Tag = 'div',
}: CardProps) {
  const cls = [styles.card, hoverable || onClick ? styles.hoverable : null, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      className={cls}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
