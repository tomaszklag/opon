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
  /** Controlled open state — if provided, AccordionCard becomes controlled */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete: () => void;
  deleteLabel?: string;
  confirmDelete?: string;
  /** When false, the delete button is hidden. Default: true */
  showDelete?: boolean;
  /** Extra action buttons rendered in the header before the delete button */
  headerActions?: React.ReactNode;
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
  open: controlledOpen,
  onOpenChange,
  onDelete,
  deleteLabel = 'Usuń',
  confirmDelete,
  showDelete = true,
  headerActions,
  children,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const [confirming, setConfirming] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  function setOpen(v: boolean) {
    if (onOpenChange) onOpenChange(v);
    else setInternalOpen(v);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete) {
      setConfirming(true);
    } else {
      onDelete();
    }
  }

  function handleHeaderKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') setOpen(!isOpen);
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
          className={`${styles.header} ${isOpen ? styles.headerOpen : ''}`}
          onClick={() => setOpen(!isOpen)}
          role="button"
          tabIndex={0}
          onKeyDown={handleHeaderKey}
          aria-expanded={isOpen}
        >
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
            <IconChevronRight
              width="8"
              height="8"
              style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
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

          {headerActions && (
            <span className={styles.headerActions} onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </span>
          )}

          {showDelete && (
            <button className={styles.delBtn} onClick={handleDelete} aria-label={deleteLabel}>
              <IconTrash width="11" height="11" />
            </button>
          )}
        </div>

        {isOpen && <div className={styles.body}>{children}</div>}
      </div>
    </>
  );
}
