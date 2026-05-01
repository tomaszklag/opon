'use client';
import React, { useState } from 'react';
import styles from './SideMenu.module.css';

export interface SideMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export interface SideMenuProps {
  items?: SideMenuItem[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DEFAULT_ITEMS: SideMenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'bookings',
    label: 'Rezerwacje',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 9h18M8 2v4M16 2v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Harmonogram',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'pricing',
    label: 'Cennik',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'reviews',
    label: 'Opinie',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Ustawienia',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function SideMenu({
  items = DEFAULT_ITEMS,
  activeItem,
  onItemClick,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SideMenuProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const toggle = onToggleCollapse ?? (() => setInternalCollapsed((c) => !c));

  return (
    <nav
      className={[styles.menu, collapsed ? styles.collapsed : null].filter(Boolean).join(' ')}
      aria-label="Menu panelu B2B"
    >
      <div className={styles.header}>
        {!collapsed && (
          <span className={styles.logo} aria-label="opony.app">
            OPONY
          </span>
        )}
        <button
          className={styles.collapseBtn}
          onClick={toggle}
          aria-label={collapsed ? 'Rozwiń menu' : 'Zwiń menu'}
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <ul className={styles.list} role="list">
        {items.map(({ id, label, icon }) => (
          <li key={id}>
            <button
              className={[styles.item, activeItem === id ? styles.activeItem : null]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onItemClick?.(id)}
              aria-current={activeItem === id ? 'page' : undefined}
              title={collapsed ? label : undefined}
              type="button"
            >
              <span className={styles.itemIcon}>{icon}</span>
              {!collapsed && <span className={styles.itemLabel}>{label}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
