'use client';
import React, { useRef } from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  key: string;
  label: string;
  count?: number;
  countWarn?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, currentIndex: number) {
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (currentIndex + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else return;

    e.preventDefault();
    const target = tabs[next];
    if (!target) return;
    onChange(target.key);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={listRef}
      className={[styles.tabs, className].filter(Boolean).join(' ')}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={[styles.tab, isActive ? styles.active : null].filter(Boolean).join(' ')}
            onClick={() => onChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            type="button"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={[styles.count, tab.countWarn ? styles.countWarn : null]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`${tab.count} pozycji`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
