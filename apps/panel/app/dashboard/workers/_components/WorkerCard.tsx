import { useState, useCallback } from 'react';
import { Button, Input, Select, Text, Textarea } from '@opony/design-system-web';
import {
  IconPlus,
  IconInfo,
  IconCalendarOff,
  IconHourglass,
  IconTrash,
} from '../../../../components/icons';
import { AccordionCard } from '../../services/_components/AccordionCard';
import type { Worker, LeaveType } from '../../../../lib/hooks/use-workers';
import type { CreateLeaveBody } from '../../../../api-data-access/workers';
import styles from '../workers.module.css';

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  VACATION: 'Urlop wypoczynkowy',
  UNPAID: 'Urlop bezpłatny',
  SICK: 'Chorobowe',
  OTHER: 'Inna nieobecność',
};

const LEAVE_TYPE_OPTIONS = (Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((k) => ({
  value: k,
  label: LEAVE_TYPE_LABELS[k],
}));

const AVATAR_COLORS = [
  'var(--accent)',
  'var(--avatar-blue-light, #4F7FFF)',
  'var(--avatar-green-light, #2EE0A0)',
  'var(--avatar-purple-light, #A855F7)',
  '#FFB020',
];

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? 'var(--accent)';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
}

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function formatDate(iso: string): string {
  return toDate(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isOnLeaveToday(startDate: string, endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= toDate(startDate) && today <= toDate(endDate);
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86400000);
}

function getLeaveStatus(leaves: Worker['leaves']) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);
  let onLeaveNow = false;
  let soonDays: number | null = null;
  for (const leave of leaves) {
    if (isOnLeaveToday(leave.startDate, leave.endDate)) onLeaveNow = true;
    const start = new Date(leave.startDate + 'T00:00:00');
    if (start > today && start <= in30) {
      const d = daysUntil(leave.startDate);
      if (soonDays === null || d < soonDays) soonDays = d;
    }
  }
  return { onLeaveNow, soonDays };
}

interface AddLeaveFormState {
  type: LeaveType;
  startDate: string;
  endDate: string;
  note: string;
}

const EMPTY_LEAVE: AddLeaveFormState = { type: 'VACATION', startDate: '', endDate: '', note: '' };

interface Props {
  worker: Worker;
  index: number;
  saving: boolean;
  defaultOpen?: boolean;
  onUpdate: (patch: { name?: string; role?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddLeave: (leave: CreateLeaveBody) => Promise<void>;
  onRemoveLeave: (leaveId: string) => Promise<void>;
}

export function WorkerCard({
  worker,
  index,
  saving,
  defaultOpen,
  onUpdate,
  onDelete,
  onAddLeave,
  onRemoveLeave,
}: Props) {
  const [name, setName] = useState(worker.name);
  const [role, setRole] = useState(worker.role ?? '');
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState<AddLeaveFormState>(EMPTY_LEAVE);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { onLeaveNow, soonDays } = getLeaveStatus(worker.leaves);

  const handleNameBlur = useCallback(async () => {
    if (name.trim() === worker.name && role.trim() === (worker.role ?? '')) return;
    if (!name.trim()) {
      setFieldError('Imię jest wymagane');
      setName(worker.name);
      return;
    }
    setFieldError(null);
    try {
      await onUpdate({ name: name.trim(), role: role.trim() || undefined });
    } catch {
      setFieldError('Błąd zapisu');
      setName(worker.name);
      setRole(worker.role ?? '');
    }
  }, [name, role, worker, onUpdate]);

  const handleRoleBlur = useCallback(async () => {
    if (name.trim() === worker.name && role.trim() === (worker.role ?? '')) return;
    if (!name.trim()) {
      setName(worker.name);
      return;
    }
    try {
      await onUpdate({ name: name.trim(), role: role.trim() || undefined });
    } catch {
      setRole(worker.role ?? '');
    }
  }, [name, role, worker, onUpdate]);

  const handleAddLeave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLeaveError(null);
      if (!leaveForm.startDate || !leaveForm.endDate) {
        setLeaveError('Wypełnij daty nieobecności');
        return;
      }
      if (leaveForm.endDate < leaveForm.startDate) {
        setLeaveError('Data końca musi być po dacie początku');
        return;
      }
      try {
        await onAddLeave({
          type: leaveForm.type,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          note: leaveForm.note.trim() || undefined,
        });
        setLeaveForm(EMPTY_LEAVE);
        setShowAddLeave(false);
      } catch (err) {
        setLeaveError(err instanceof Error ? err.message : 'Błąd dodawania nieobecności');
      }
    },
    [leaveForm, onAddLeave],
  );

  const avatar = (
    <div className={styles.avatar} style={{ background: getAvatarColor(index) }}>
      {getInitials(worker.name)}
    </div>
  );

  const badge = worker.role ? (
    <Text variant="nano" as="span" color="secondary">
      {worker.role}
    </Text>
  ) : undefined;

  const meta = (
    <>
      {worker.stations.length > 0 && (
        <div className={styles.stationChips}>
          {worker.stations.slice(0, 2).map((s) => (
            <span key={s.stationId} className={styles.stationChip}>
              <Text variant="nano" as="span" weight="bold">
                {s.stationName}
              </Text>
            </span>
          ))}
          {worker.stations.length > 2 && (
            <Text variant="nano" as="span" color="muted">
              +{worker.stations.length - 2}
            </Text>
          )}
        </div>
      )}
      {onLeaveNow && (
        <span className={styles.leaveBadgeVacation}>
          <Text variant="nano" as="span" weight="bold">
            Na urlopie
          </Text>
        </span>
      )}
      {!onLeaveNow && soonDays !== null && (
        <span className={styles.leaveBadgeSoon}>
          <Text variant="nano" as="span" weight="bold">
            Urlop za {soonDays} dni
          </Text>
        </span>
      )}
    </>
  );

  return (
    <AccordionCard
      label={worker.name}
      emptyLabel="Pracownik bez nazwy"
      icon={avatar}
      badge={badge}
      meta={meta}
      defaultOpen={defaultOpen}
      onDelete={onDelete}
      deleteLabel="Usuń pracownika"
      confirmDelete={`Czy na pewno chcesz usunąć pracownika „${worker.name}"? Tej operacji nie można cofnąć.`}
    >
      <div className={styles.workerBody}>
        {/* Imię */}
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Imię
          </Text>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            error={fieldError ?? undefined}
            required
            aria-label="Imię i nazwisko"
          />
        </div>

        {/* Rola */}
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Rola
          </Text>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onBlur={handleRoleBlur}
            placeholder="np. Mechanik"
            aria-label="Stanowisko / rola"
          />
        </div>

        {/* Stanowiska */}
        <div className={styles.fieldRow}>
          <Text variant="nano" as="span" weight="bold" color="muted" className={styles.fieldLabel}>
            Stanowiska
          </Text>
          <div className={styles.stationsReadonly}>
            {worker.stations.length === 0 ? (
              <Text variant="body-sm" as="span" color="muted">
                Brak przypisanych stanowisk
              </Text>
            ) : (
              worker.stations.map((s) => (
                <span key={s.stationId} className={styles.stationChipLarge}>
                  <Text variant="body-sm" as="span" weight="bold" color="accent">
                    {s.stationName}
                    {s.shiftStart && s.shiftEnd ? ` (${s.shiftStart}–${s.shiftEnd})` : ''}
                  </Text>
                </span>
              ))
            )}
            <Text variant="nano" as="span" color="muted">
              Zarządzaj w ekranie Stanowiska
            </Text>
          </div>
        </div>

        {/* Urlopy */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>
            <Text variant="nano" as="span" weight="bold" color="muted">
              Urlopy
            </Text>
            {worker.leaves.length > 0 && (
              <Text variant="nano" as="span" color="muted" mono>
                {worker.leaves.length} zap.
              </Text>
            )}
          </div>
          <div className={styles.leaveList}>
            {worker.leaves.map((leave) => {
              const onNow = isOnLeaveToday(leave.startDate, leave.endDate);
              const d = daysUntil(leave.startDate);
              const itemClass = [
                styles.leaveItem,
                onNow ? styles.leaveItemUpcoming : d >= 0 && d <= 30 ? styles.leaveItemSoon : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <div key={leave.id} className={itemClass}>
                  <div className={styles.leaveIco}>
                    {leave.type === 'SICK' ? (
                      <IconHourglass width="16" height="16" />
                    ) : (
                      <IconCalendarOff width="16" height="16" />
                    )}
                  </div>
                  <div className={styles.leaveInfo}>
                    <div className={styles.leaveNameRow}>
                      <Text variant="body-sm" as="span" weight="bold">
                        {LEAVE_TYPE_LABELS[leave.type]}
                      </Text>
                    </div>
                    <Text
                      variant="nano"
                      as="span"
                      mono
                      color="secondary"
                      className={styles.leaveDates}
                    >
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </Text>
                    {leave.note && (
                      <Text variant="nano" as="span" color="muted" className={styles.leaveDur}>
                        {leave.note}
                      </Text>
                    )}
                  </div>
                  <div className={styles.leaveActions}>
                    <button
                      type="button"
                      className={styles.leaveActionBtn}
                      title="Usuń nieobecność"
                      onClick={() => onRemoveLeave(leave.id)}
                      disabled={saving}
                    >
                      <IconTrash width="12" height="12" />
                    </button>
                  </div>
                </div>
              );
            })}

            {!showAddLeave ? (
              <button
                type="button"
                className={styles.addLeaveBtn}
                onClick={() => setShowAddLeave(true)}
              >
                <IconPlus width="12" height="12" />
                <Text variant="body-sm" as="span" weight="bold" color="accent">
                  Dodaj urlop lub nieobecność
                </Text>
              </button>
            ) : (
              <form className={styles.addLeaveForm} onSubmit={handleAddLeave}>
                <Select
                  label="Typ nieobecności"
                  options={LEAVE_TYPE_OPTIONS}
                  value={leaveForm.type}
                  onChange={(e) =>
                    setLeaveForm((prev) => ({ ...prev, type: e.target.value as LeaveType }))
                  }
                />
                <div className={styles.addLeaveFormRow}>
                  <Input
                    label="Data początku"
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    required
                  />
                  <Input
                    label="Data końca"
                    type="date"
                    value={leaveForm.endDate}
                    min={leaveForm.startDate || undefined}
                    onChange={(e) => setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
                <Textarea
                  label="Notatka (opcjonalnie)"
                  placeholder="Dodatkowe informacje..."
                  value={leaveForm.note}
                  onChange={(e) => setLeaveForm((prev) => ({ ...prev, note: e.target.value }))}
                  maxLength={500}
                />
                {leaveError && (
                  <Text variant="body-sm" as="p" className={styles.leaveError}>
                    {leaveError}
                  </Text>
                )}
                <div className={styles.leaveNote}>
                  <IconInfo width="12" height="12" className={styles.leaveNoteIcon} />
                  <Text variant="nano" as="span" color="muted">
                    Nowe rezerwacje blokowane automatycznie · istniejące: anuluj ręcznie w
                    Rezerwacjach
                  </Text>
                </div>
                <div className={styles.addLeaveFormActions}>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    loading={saving}
                    disabled={saving}
                  >
                    Zapisz nieobecność
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setShowAddLeave(false);
                      setLeaveForm(EMPTY_LEAVE);
                      setLeaveError(null);
                    }}
                  >
                    Anuluj
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AccordionCard>
  );
}
