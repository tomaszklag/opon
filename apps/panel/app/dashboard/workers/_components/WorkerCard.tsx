import { useState, useCallback } from 'react';
import { Button, Input, Select, Text, Heading, Textarea } from '@opony/design-system-web';
import {
  IconChevronRight,
  IconTrash,
  IconPlus,
  IconInfo,
  IconCalendarOff,
  IconHourglass,
} from '../../../../components/icons';
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

// Avatar background colors — runtime palette cycled by worker index.
// Only var(--accent) has a DS token; others are local palette values kept as constants.
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
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? '').toUpperCase();
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isOnLeaveToday(startDate: string, endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  return today >= start && today <= end;
}

function getLeaveStatus(leaves: Worker['leaves']): {
  onLeaveNow: boolean;
  soonDays: number | null;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30 = new Date(today);
  in30.setDate(in30.getDate() + 30);

  let onLeaveNow = false;
  let soonDays: number | null = null;

  for (const leave of leaves) {
    if (isOnLeaveToday(leave.startDate, leave.endDate)) {
      onLeaveNow = true;
    }
    const start = new Date(leave.startDate + 'T00:00:00');
    if (start > today && start <= in30) {
      const d = daysUntil(leave.startDate);
      if (soonDays === null || d < soonDays) soonDays = d;
    }
  }

  return { onLeaveNow, soonDays };
}

function getLeaveItemClass(startDate: string, endDate: string): string {
  if (isOnLeaveToday(startDate, endDate))
    return `${styles.leaveItem ?? ''} ${styles.leaveItemUpcoming ?? ''}`;
  const d = daysUntil(startDate);
  if (d >= 0 && d <= 30) return `${styles.leaveItem ?? ''} ${styles.leaveItemSoon ?? ''}`;
  return styles.leaveItem ?? '';
}

interface AddLeaveFormState {
  type: LeaveType;
  startDate: string;
  endDate: string;
  note: string;
}

const EMPTY_LEAVE: AddLeaveFormState = {
  type: 'VACATION',
  startDate: '',
  endDate: '',
  note: '',
};

interface Props {
  worker: Worker;
  index: number;
  isExpanded: boolean;
  saving: boolean;
  onToggle: () => void;
  onUpdate: (patch: { name?: string; role?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddLeave: (leave: CreateLeaveBody) => Promise<void>;
  onRemoveLeave: (leaveId: string) => Promise<void>;
}

export function WorkerCard({
  worker,
  index,
  isExpanded,
  saving,
  onToggle,
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
  const [confirmDelete, setConfirmDelete] = useState(false);
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

  const avatarColor = getAvatarColor(index);
  const initials = getInitials(worker.name);

  const cardClass = [styles.workerCard, isExpanded ? styles.workerCardExpanded : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass}>
      {/* ── Header (collapsed & expanded) ── */}
      <div
        className={styles.workerHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {/* Avatar background is a runtime value (worker index → palette color) — must be inline */}
        <div className={styles.avatar} style={{ background: avatarColor }}>
          {initials}
        </div>

        <div className={styles.workerHeaderInfo}>
          <Heading variant="subsection" as="span">
            {worker.name}
          </Heading>
          {worker.role && (
            <Text variant="body-sm" as="span" color="secondary">
              {worker.role}
            </Text>
          )}
        </div>

        {/* Station chips */}
        {worker.stations.length > 0 && (
          <div className={styles.stationChips}>
            {worker.stations.map((s) => (
              <span key={s.stationId} className={styles.stationChip}>
                <Text variant="nano" as="span" weight="bold">
                  {s.stationName}
                </Text>
              </span>
            ))}
          </div>
        )}

        {/* Leave badge */}
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

        {/* DS nie ma ChevronDown — IconChevronRight obrócony przez .chevronOpen */}
        <IconChevronRight
          width="16"
          height="16"
          className={[styles.chevron, styles.chevronDown, isExpanded ? styles.chevronOpen : '']
            .filter(Boolean)
            .join(' ')}
        />
      </div>

      {/* ── Expanded body ── */}
      {isExpanded && (
        <div className={styles.workerBody}>
          {/* Basic info */}
          <div>
            <div className={styles.sectionLabel}>
              <span>Dane</span>
            </div>
            <div className={styles.fieldsRow}>
              <Input
                label="Imię i nazwisko"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                error={fieldError ?? undefined}
                required
              />
              <Input
                label="Stanowisko / rola (opcjonalne)"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onBlur={handleRoleBlur}
                placeholder="np. Mechanik"
              />
            </div>
          </div>

          {/* Stations */}
          <div>
            <div className={styles.sectionLabel}>
              <span>Stanowiska</span>
            </div>
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

          {/* Leaves */}
          <div>
            <div className={styles.sectionLabel}>
              <span>Urlopy i nieobecności</span>
              {worker.leaves.length > 0 && (
                <Text variant="nano" as="span" mono color="muted">
                  {worker.leaves.length} zaplanowane
                </Text>
              )}
            </div>
            <div className={styles.leaveList}>
              {worker.leaves.map((leave) => (
                <div key={leave.id} className={getLeaveItemClass(leave.startDate, leave.endDate)}>
                  <div className={styles.leaveIco}>
                    {leave.type === 'SICK' ? (
                      <IconHourglass width="16" height="16" />
                    ) : leave.type === 'OTHER' ? (
                      <IconCalendarOff width="16" height="16" />
                    ) : (
                      <IconCalendarOff width="16" height="16" />
                    )}
                  </div>
                  <div className={styles.leaveInfo}>
                    <div className={styles.leaveNameRow}>
                      <Text variant="body-sm" as="span" weight="bold">
                        {LEAVE_TYPE_LABELS[leave.type]}
                      </Text>
                      <span
                        className={`${styles.leaveTypeTag}${
                          leave.type === 'SICK'
                            ? ` ${styles.leaveTypeTagSick}`
                            : leave.type === 'OTHER'
                              ? ` ${styles.leaveTypeTagOther}`
                              : ''
                        }`}
                      >
                        <Text variant="nano" as="span" mono weight="bold">
                          {LEAVE_TYPE_LABELS[leave.type]}
                        </Text>
                      </span>
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
                    <Text variant="nano" as="span" color="muted" className={styles.leaveDur}>
                      Nowe rezerwacje blokowane automatycznie · istniejące: anuluj ręcznie w
                      Rezerwacjach
                    </Text>
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
              ))}

              {/* Add leave button / form */}
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
                      onChange={(e) =>
                        setLeaveForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
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
                      onClick={() => {
                        setShowAddLeave(false);
                        setLeaveForm(EMPTY_LEAVE);
                        setLeaveError(null);
                      }}
                      disabled={saving}
                    >
                      Anuluj
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Delete worker */}
          <div className={styles.deleteWorkerWrap}>
            {!confirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
              >
                <IconTrash width="13" height="13" />
                Usuń pracownika
              </Button>
            ) : (
              <div className={styles.confirmDeleteRow}>
                <Text variant="body-sm" as="span" color="secondary">
                  Na pewno usunąć?
                </Text>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDelete}
                  loading={saving}
                  disabled={saving}
                >
                  Usuń
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={saving}
                >
                  Anuluj
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
