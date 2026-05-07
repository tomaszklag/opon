'use client';

import { useState } from 'react';
import { Heading, Input, Spinner, Text, TimeInput } from '@opony/design-system-web';
import { IconPlus, IconTrash, IconCalendarOff } from '../../../../components/icons';
import { type ScheduleException } from '../../../../api-data-access/schedule-exceptions';
import styles from './ExceptionsPanel.module.css';

const DAY_NAMES = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
const MONTH_NAMES = [
  'sty',
  'lut',
  'mar',
  'kwi',
  'maj',
  'cze',
  'lip',
  'sie',
  'wrz',
  'paź',
  'lis',
  'gru',
];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z');
  const dow = DAY_NAMES[d.getUTCDay()];
  const day = d.getUTCDate();
  const mon = MONTH_NAMES[d.getUTCMonth()];
  const yr = d.getUTCFullYear();
  const thisYear = new Date().getFullYear();
  return yr !== thisYear ? `${dow}, ${day} ${mon} ${yr}` : `${dow}, ${day} ${mon}`;
}

function isPast(iso: string): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return new Date(iso + 'T00:00:00Z') < today;
}

type Mode = 'closed' | 'custom';

interface Props {
  exceptions: ScheduleException[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  onAdd: (date: string, reason: string, openTime?: string, closeTime?: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function ExceptionsPanel({ exceptions, loading, saving, error, onAdd, onRemove }: Props) {
  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<Mode>('closed');
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('14:00');

  const today = new Date().toISOString().slice(0, 10);

  function reset() {
    setAdding(false);
    setDate('');
    setReason('');
    setMode('closed');
    setOpenTime('10:00');
    setCloseTime('14:00');
  }

  async function handleSubmit() {
    if (!date || !reason.trim()) return;
    await onAdd(
      date,
      reason.trim(),
      mode === 'custom' ? openTime : undefined,
      mode === 'custom' ? closeTime : undefined,
    );
    reset();
  }

  const upcoming = exceptions.filter((e) => !isPast(e.date));
  const past = exceptions.filter((e) => isPast(e.date));

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <Heading variant="subsection" as="h3">
          Wyjątki &amp; urlopy
        </Heading>
        <Text variant="nano" as="span" color="muted" mono>
          zamknięcia i inne zmiany
        </Text>
      </div>

      {loading ? (
        <div className={styles.loadingRow}>
          <Spinner size="sm" label="Ładowanie…" />
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length === 0 && !adding ? (
            <div className={styles.empty}>
              <IconCalendarOff width="20" height="20" className={styles.emptyIcon} />
              <Text variant="nano" as="span" color="muted">
                Brak zaplanowanych wyjątków
              </Text>
            </div>
          ) : (
            <div className={styles.list}>
              {upcoming.map((exc) => (
                <ExceptionRow key={exc.id} exc={exc} onRemove={onRemove} saving={saving} />
              ))}
            </div>
          )}

          {/* Add form */}
          {adding ? (
            <div className={styles.form}>
              <div className={styles.formRow}>
                <Input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <Input
                placeholder="Powód (np. Boże Narodzenie, urlop)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className={styles.modeRow}>
                <button
                  className={`${styles.modeBtn} ${mode === 'closed' ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode('closed')}
                  type="button"
                >
                  <Text variant="nano" as="span">
                    Cały dzień zamknięty
                  </Text>
                </button>
                <button
                  className={`${styles.modeBtn} ${mode === 'custom' ? styles.modeBtnActive : ''}`}
                  onClick={() => setMode('custom')}
                  type="button"
                >
                  <Text variant="nano" as="span">
                    Zmienione godziny
                  </Text>
                </button>
              </div>

              {mode === 'custom' && (
                <div className={styles.timeRow}>
                  <TimeInput label="Od" value={openTime} onChange={setOpenTime} />
                  <Text variant="nano" as="span" color="muted">
                    –
                  </Text>
                  <TimeInput label="Do" value={closeTime} onChange={setCloseTime} />
                </div>
              )}

              <div className={styles.formActions}>
                <button className={styles.cancelBtn} onClick={reset} type="button">
                  <Text variant="nano" as="span" color="muted">
                    Anuluj
                  </Text>
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={handleSubmit}
                  disabled={!date || !reason.trim() || saving}
                  type="button"
                >
                  <Text variant="nano" as="span" weight="bold">
                    {saving ? 'Zapisuję…' : 'Zapisz'}
                  </Text>
                </button>
              </div>
            </div>
          ) : (
            <button className={styles.addBtn} onClick={() => setAdding(true)}>
              <IconPlus width="9" height="9" />
              <Text variant="nano" as="span" weight="bold" color="accent">
                Dodaj wyjątek
              </Text>
            </button>
          )}

          {error && (
            <Text variant="nano" as="p" color="danger" style={{ marginTop: 4 }}>
              {error}
            </Text>
          )}

          {/* Past exceptions (collapsed) */}
          {past.length > 0 && (
            <div className={styles.pastSection}>
              <Text variant="nano" as="span" color="muted">
                Minione ({past.length})
              </Text>
              <div className={styles.list}>
                {past.map((exc) => (
                  <ExceptionRow key={exc.id} exc={exc} onRemove={onRemove} saving={saving} past />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExceptionRow({
  exc,
  onRemove,
  saving,
  past,
}: {
  exc: ScheduleException;
  onRemove: (id: string) => Promise<void>;
  saving: boolean;
  past?: boolean;
}) {
  return (
    <div className={`${styles.row} ${past ? styles.rowPast : ''}`}>
      <div className={styles.rowDate}>
        <Text
          variant="nano"
          as="span"
          mono
          weight="bold"
          color={past ? 'muted' : exc.isClosed ? 'danger' : 'accent'}
        >
          {formatDate(exc.date)}
        </Text>
      </div>
      <div className={styles.rowInfo}>
        <Text variant="nano" as="span" color={past ? 'muted' : 'secondary'}>
          {exc.reason}
        </Text>
        {exc.isClosed ? (
          <Text variant="nano" as="span" color="muted" mono>
            zamknięte
          </Text>
        ) : (
          <Text variant="nano" as="span" color="muted" mono>
            {exc.customOpenTime}–{exc.customCloseTime}
          </Text>
        )}
      </div>
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(exc.id)}
        disabled={saving}
        aria-label="Usuń wyjątek"
      >
        <IconTrash width="10" height="10" />
      </button>
    </div>
  );
}
