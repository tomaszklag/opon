'use client';

import { useState, useEffect } from 'react';
import { Button, Spinner, Text, Heading } from '@opony/design-system-web';
import { toast } from '@opony/design-system-web';
import useSWR from 'swr';
import { workerTasksApi, type WorkerTask } from '../../../api-data-access/worker-tasks';
import { bookingsApi } from '../../../api-data-access/bookings';
import { useWorkerTaskDetail } from '../../../lib/hooks/use-worker-task-detail';
import { IconXClose, IconTrash, IconCalendar } from '../../../components/icons';
import styles from './WorkerTaskDetailPanel.module.css';

interface Props {
  taskId: string | null;
  onClose: () => void;
  onMutate?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('pl-PL', opts);
}

function formatRange(startAt: string, endAt: string): string {
  const day = fmt(startAt, { weekday: 'short', day: 'numeric', month: 'short' });
  const from = fmt(startAt, { hour: '2-digit', minute: '2-digit' });
  const to = fmt(endAt, { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${from} – ${to}`;
}

// ── Booking search ────────────────────────────────────────────────────────────

function useBookingSearch(search: string) {
  const { data, isLoading } = useSWR(
    search.length >= 2 ? ['booking-search-panel', search] : null,
    () => bookingsApi.listAdmin({ search, page: 1, pageSize: 6 }),
    { revalidateOnFocus: false, dedupingInterval: 300 },
  );
  return { results: data?.items ?? [], isLoading };
}

function BookingPicker({
  onSelect,
}: {
  onSelect: (b: { id: string; referenceCode: string; clientName: string; startAt: string }) => void;
}) {
  const [search, setSearch] = useState('');
  const { results, isLoading } = useBookingSearch(search);

  return (
    <div className={styles.picker}>
      <input
        className={styles.pickerInput}
        placeholder="Szukaj rezerwacji (klient, #kod)…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      {isLoading && search.length >= 2 && (
        <div className={styles.pickerEmpty}>
          <Spinner size="sm" />
        </div>
      )}
      {!isLoading && search.length >= 2 && results.length === 0 && (
        <div className={styles.pickerEmpty}>
          <Text variant="body-sm" color="muted" as="span">
            Brak wyników
          </Text>
        </div>
      )}
      {results.length > 0 && (
        <div className={styles.pickerList}>
          {results.map((b) => (
            <button
              key={b.id}
              type="button"
              className={styles.pickerItem}
              onClick={() =>
                onSelect({
                  id: b.id,
                  referenceCode: b.referenceCode,
                  clientName: b.clientName,
                  startAt: b.startAt,
                })
              }
            >
              <Text variant="nano" mono weight="bold" color="muted" as="span">
                #{b.referenceCode}
              </Text>
              <Text variant="body-sm" weight="bold" as="span">
                {b.clientName}
              </Text>
              <Text variant="nano" mono color="muted" as="span">
                {fmt(b.startAt, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Panel content ─────────────────────────────────────────────────────────────

function PanelContent({
  task,
  onClose,
  onMutate,
  mutate,
}: {
  task: WorkerTask;
  onClose: () => void;
  onMutate?: () => void;
  mutate: () => void;
}) {
  const [notes, setNotes] = useState(task.notes ?? '');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesChanged, setNotesChanged] = useState(false);
  const [linkSaving, setLinkSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNotes(task.notes ?? '');
    setNotesChanged(false);
  }, [task.id, task.notes]);

  async function saveNotes() {
    setNotesSaving(true);
    try {
      await workerTasksApi.update(task.id, { notes: notes || null });
      void mutate();
      onMutate?.();
    } catch {
      toast.error('Nie udało się zapisać notatek.');
    } finally {
      setNotesSaving(false);
    }
  }

  async function linkBooking(booking: {
    id: string;
    referenceCode: string;
    clientName: string;
    startAt: string;
  }) {
    setLinkSaving(true);
    setShowPicker(false);
    try {
      await workerTasksApi.update(task.id, { linkedBookingId: booking.id });
      void mutate();
      onMutate?.();
      toast.success(`Powiązano z wizytą #${booking.referenceCode}.`);
    } catch {
      toast.error('Nie udało się powiązać rezerwacji.');
    } finally {
      setLinkSaving(false);
    }
  }

  async function unlinkBooking() {
    setLinkSaving(true);
    try {
      await workerTasksApi.update(task.id, { linkedBookingId: null });
      void mutate();
      onMutate?.();
    } catch {
      toast.error('Nie udało się usunąć powiązania.');
    } finally {
      setLinkSaving(false);
    }
  }

  async function deleteTask() {
    setDeleting(true);
    try {
      await workerTasksApi.remove(task.id);
      onMutate?.();
      onClose();
    } catch {
      toast.error('Nie udało się usunąć zadania.');
      setDeleting(false);
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.taskBadge}>Zadanie</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Zamknij panel"
          >
            <IconXClose width={16} height={16} />
          </button>
        </div>
        <Heading variant="subsection" as="h2">
          {task.title}
        </Heading>
        {task.workerName && (
          <Text variant="body-sm" color="secondary" as="p">
            {task.workerName}
          </Text>
        )}
      </div>

      <hr className={styles.divider} />

      {/* ── Czas ── */}
      <div className={styles.section}>
        <div className={styles.metaRow}>
          <IconCalendar className={styles.metaIcon} width={14} height={14} />
          <Text variant="body-sm" as="span">
            {formatRange(task.startAt, task.endAt)}
          </Text>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* ── Notatki ── */}
      <div className={styles.section}>
        <Text variant="nano" weight="bold" color="muted" as="p" className={styles.sectionLabel}>
          Notatki
        </Text>
        <textarea
          className={styles.notesArea}
          value={notes}
          rows={4}
          placeholder="Dodaj notatkę do zadania…"
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesChanged(e.target.value !== (task.notes ?? ''));
          }}
        />
        {notesChanged && (
          <div className={styles.saveRow}>
            <Button
              variant="primary"
              size="sm"
              onClick={saveNotes}
              loading={notesSaving}
              disabled={notesSaving}
            >
              Zapisz
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNotes(task.notes ?? '');
                setNotesChanged(false);
              }}
              disabled={notesSaving}
            >
              Anuluj
            </Button>
          </div>
        )}
      </div>

      <hr className={styles.divider} />

      {/* ── Powiązana rezerwacja ── */}
      <div className={styles.section}>
        <Text variant="nano" weight="bold" color="muted" as="p" className={styles.sectionLabel}>
          Powiązana rezerwacja
        </Text>
        {task.linkedBooking ? (
          <div className={styles.linkedCard}>
            <div className={styles.linkedInfo}>
              <Text variant="nano" mono weight="bold" color="muted" as="span">
                #{task.linkedBooking.referenceCode}
              </Text>
              <Text variant="body-sm" weight="bold" as="span">
                {task.linkedBooking.clientName}
              </Text>
              <Text variant="nano" mono color="muted" as="span">
                {fmt(task.linkedBooking.startAt, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </div>
            <button
              type="button"
              className={styles.unlinkBtn}
              aria-label="Usuń powiązanie"
              onClick={unlinkBooking}
              disabled={linkSaving}
            >
              <IconXClose width={12} height={12} />
            </button>
          </div>
        ) : (
          <>
            {showPicker ? (
              <>
                <BookingPicker onSelect={linkBooking} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPicker(false)}
                  className={styles.cancelBtn}
                >
                  Anuluj
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPicker(true)}
                disabled={linkSaving}
                loading={linkSaving}
              >
                + Powiąż z rezerwacją
              </Button>
            )}
          </>
        )}
      </div>

      {/* ── Usuń ── */}
      <div className={styles.dangerSection}>
        <Button
          variant="danger"
          size="sm"
          onClick={deleteTask}
          loading={deleting}
          disabled={deleting}
        >
          <IconTrash width={13} height={13} />
          Usuń zadanie
        </Button>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function WorkerTaskDetailPanel({ taskId, onClose, onMutate }: Props) {
  const { task, isLoading, mutate } = useWorkerTaskDetail(taskId);

  useEffect(() => {
    if (taskId === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [taskId, onClose]);

  if (taskId === null) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label="Szczegóły zadania" className={styles.panel}>
        {isLoading && (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        )}
        {!isLoading && task && (
          <PanelContent task={task} onClose={onClose} onMutate={onMutate} mutate={mutate} />
        )}
        {!isLoading && !task && (
          <div className={styles.loading}>
            <Text variant="body-sm" color="muted" as="p">
              Nie znaleziono zadania.
            </Text>
          </div>
        )}
      </div>
    </>
  );
}
