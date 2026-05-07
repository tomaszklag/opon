'use client';

import { useState } from 'react';
import { Button, Heading, Modal, Text, Toggle } from '@opony/design-system-web';
import { IconChevronRight, IconTrash } from '../../../../components/icons';
import styles from './AccordionCard.module.css';

interface Props {
  label: string;
  emptyLabel?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  enabled?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  onDelete: () => void;
  deleteLabel?: string;
  confirmDelete?: string;
  children: React.ReactNode;
}

export function AccordionCard({
  label,
  emptyLabel = 'Bez nazwy',
  icon,
  badge,
  meta,
  enabled = true,
  onToggle,
  defaultOpen,
  onDelete,
  deleteLabel = 'Usuń',
  confirmDelete,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [confirming, setConfirming] = useState(false);

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete) {
      setConfirming(true);
    } else {
      onDelete();
    }
  }

  function handleHeaderKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
  }

  return (
    <>
      {confirmDelete && (
        <Modal
          isOpen={confirming}
          onClose={() => setConfirming(false)}
          title="Potwierdź usunięcie"
          size="sm"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Anuluj
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setConfirming(false);
                  onDelete();
                }}
              >
                Usuń
              </Button>
            </>
          }
        >
          <Text variant="body-sm" as="p" color="secondary">
            {confirmDelete}
          </Text>
        </Modal>
      )}
      <div className={`${styles.card} ${!enabled ? styles.cardDisabled : ''}`}>
        <div
          className={`${styles.header} ${open ? styles.headerOpen : ''}`}
          onClick={() => setOpen((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={handleHeaderKey}
          aria-expanded={open}
        >
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
            <IconChevronRight
              width="8"
              height="8"
              style={{
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </span>

          {icon && <span className={styles.icon}>{icon}</span>}

          <Heading variant="subsection" as="span" className={label ? undefined : styles.emptyLabel}>
            {label || emptyLabel}
          </Heading>

          {badge && <span className={styles.badge}>{badge}</span>}

          <span className={styles.spacer} />

          {meta && <span className={styles.meta}>{meta}</span>}

          {onToggle && (
            <span className={styles.toggleWrap} onClick={(e) => e.stopPropagation()}>
              <Toggle
                size="sm"
                checked={enabled}
                onChange={() => onToggle()}
                aria-label={enabled ? 'Wyłącz' : 'Włącz'}
              />
            </span>
          )}

          <button className={styles.delBtn} onClick={handleDelete} aria-label={deleteLabel}>
            <IconTrash width="11" height="11" />
          </button>
        </div>

        {open && <div className={styles.body}>{children}</div>}
      </div>
    </>
  );
}
