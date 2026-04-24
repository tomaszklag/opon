'use client';
import React from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  key: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  return (
    <div className={[styles.tabs, className].filter(Boolean).join(' ')} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            className={[styles.tab, isActive ? styles.active : null].filter(Boolean).join(' ')}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={styles.count} aria-label={`${tab.count} pozycji`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
