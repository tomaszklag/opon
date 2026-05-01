import React from 'react';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? '').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function Avatar({ src, alt, name, size = 'md', status, className }: AvatarProps) {
  const initials = name ? getInitials(name) : null;
  const hasImg = Boolean(src);

  const inner = (
    <span
      className={[styles.avatar, styles[size], className].filter(Boolean).join(' ')}
      aria-label={!hasImg ? (alt ?? name) : undefined}
      role={!hasImg && (alt ?? name) ? 'img' : undefined}
    >
      {src ? (
        <img src={src} alt={alt ?? name ?? ''} className={styles.img} />
      ) : initials ? (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      ) : (
        <svg className={styles.placeholder} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );

  if (!status) return inner;

  return (
    <span className={[styles.root, styles[size]].join(' ')} data-status={status}>
      {inner}
    </span>
  );
}
