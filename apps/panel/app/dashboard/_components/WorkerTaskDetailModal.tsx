'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Modal, Button, Text, Spinner } from '@opony/design-system-web';
import { toast } from '@opony/design-system-web';
import { workerTasksApi, type WorkerTask } from '../../../api-data-access/worker-tasks';
import { bookingsApi } from '../../../api-data-access/bookings';
import { useWorkerTaskDetail } from '../../../lib/hooks/use-worker-task-detail';
import { IconTrash, IconXClose } from '../../../components/icons';
import styles from './WorkerTaskDetailModal.module.css';

interface Props {
  taskId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

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
    search.length >= 2 ? ['booking-search', search] : null,
    () => bookingsApi.listAdmin({ search, page: 1, pageSize: 6 }),
    { revalidateOnFocus: false, dedupingInterval: 300 },
  );
  return { results: data?.items ?? [], isLoading };
}

interface BookingPickerProps {
  onSelect: (booking: {
    id: string;
    referenceCode: string;
    clientName: string;
    startAt: string;
  }) => void;
}

function BookingPicker({ onSelect }: BookingPickerProps) {
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

// ── Detail content ────────────────────────────────────────────────────────────

function DetailContent({
  task,
  onUpdated,
  onDeleted,
}: {
  task: WorkerTask;
  onUpdated: (t: WorkerTask) => void;
  onDeleted: () => void;
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
  }, [task.id]);

  async function saveNotes() {
    setNotesSaving(true);
    try {
      const updated = await workerTasksApi.update(task.id, { notes: notes || null });
      onUpdated(updated);
      setNotesChanged(false);
      toast.success('Notatki zapisane.');
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
      const updated = await workerTasksApi.update(task.id, { linkedBookingId: booking.id });
      onUpdated(updated);
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
      const updated = await workerTasksApi.update(task.id, { linkedBookingId: null });
      onUpdated(updated);
      toast.success('Usunięto powiązanie z rezerwacją.');
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
      onDeleted();
    } catch {
      toast.error('Nie udało się usunąć zadania.');
      setDeleting(false);
    }
  }

  return (
    <div className={styles.body}>
      {/* ── Meta ── */}
      <div className={styles.metaBlock}>
        <div className={styles.metaRow}>
          <Text variant="nano" color="muted" as="span">
            Czas
          </Text>
          <Text variant="body-sm" weight="bold" mono as="span">
            {formatRange(task.startAt, task.endAt)}
          </Text>
        </div>
        {task.workerName && (
          <div className={styles.metaRow}>
            <Text variant="nano" color="muted" as="span">
              Pracownik
            </Text>
            <Text variant="body-sm" weight="bold" as="span">
              {task.workerName}
            </Text>
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      <section className={styles.section}>
        <Text
          variant="nano"
          weight="bold"
          color="secondary"
          as="div"
          className={styles.sectionLabel}
        >
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
              Zapisz notatki
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
      </section>

      {/* ── Linked booking ── */}
      <section className={styles.section}>
        <Text
          variant="nano"
          weight="bold"
          color="secondary"
          as="div"
          className={styles.sectionLabel}
        >
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
                  className={styles.cancelPickerBtn}
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
      </section>

      {/* ── Danger ── */}
      <section className={styles.dangerSection}>
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
      </section>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function WorkerTaskDetailModal({ taskId, onClose, onDeleted }: Props) {
  const { task, isLoading, mutate } = useWorkerTaskDetail(taskId);

  function handleUpdated(updated: WorkerTask) {
    void mutate(updated, false);
  }

  function handleDeleted() {
    onDeleted?.();
    onClose();
  }

  return (
    <Modal
      isOpen={taskId !== null}
      onClose={onClose}
      title={task ? task.title : 'Zadanie'}
      size="sm"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Zamknij
        </Button>
      }
    >
      {isLoading && (
        <div className={styles.loading}>
          <Spinner size="md" />
        </div>
      )}
      {!isLoading && task && (
        <DetailContent task={task} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      )}
    </Modal>
  );
}
