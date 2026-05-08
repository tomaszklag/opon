import { useState, useCallback } from 'react';
import { Button, Combobox, DatePicker, Input, Text, Textarea } from '@opony/design-system-web';
import { IconPlus, IconInfo, IconPencil, IconTrash } from '../../../../components/icons';
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

export const LEAVE_TYPE_COLORS: Record<LeaveType, string> = {
  VACATION: 'var(--accent)',
  SICK: 'var(--warning)',
  UNPAID: '#A855F7',
  OTHER: 'var(--text-muted)',
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

function countDays(startDate: string, endDate: string): number {
  return Math.round((toDate(endDate).getTime() - toDate(startDate).getTime()) / 86400000) + 1;
}

function isPastLeave(endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toDate(endDate) < today;
}

function getYearSummary(leaves: Worker['leaves']): Partial<Record<LeaveType, number>> {
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const summary: Partial<Record<LeaveType, number>> = {};
  for (const leave of leaves) {
    const start = toDate(leave.startDate);
    const end = toDate(leave.endDate);
    if (end < yearStart || start > yearEnd) continue;
    const overlapStart = start < yearStart ? yearStart : start;
    const overlapEnd = end > yearEnd ? yearEnd : end;
    const days = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / 86400000) + 1;
    if (days > 0) summary[leave.type] = (summary[leave.type] ?? 0) + days;
  }
  return summary;
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
    const start = toDate(leave.startDate);
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
  onEditLeave: (leave: Worker['leaves'][0]) => void;
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
  onEditLeave,
  onRemoveLeave,
}: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [name, setName] = useState(worker.name);
  const [role, setRole] = useState(worker.role ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [showAddLeave, setShowAddLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState<AddLeaveFormState>(EMPTY_LEAVE);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // Local set of past leave IDs that user has soft-cancelled (stays in history with strikethrough)
  const [softCancelledIds, setSoftCancelledIds] = useState<Set<string>>(new Set());

  const { onLeaveNow, soonDays } = getLeaveStatus(worker.leaves);

  const handleEditClick = useCallback(() => {
    setIsOpen(true);
    setIsEditingIdentity(true);
  }, []);

  const handleSaveIdentity = useCallback(async () => {
    if (!name.trim()) {
      setFieldError('Imię jest wymagane');
      return;
    }
    setFieldError(null);
    try {
      await onUpdate({ name: name.trim(), role: role.trim() || undefined });
      setIsEditingIdentity(false);
    } catch {
      setFieldError('Błąd zapisu');
    }
  }, [name, role, onUpdate]);

  const handleCancelIdentity = useCallback(() => {
    setName(worker.name);
    setRole(worker.role ?? '');
    setFieldError(null);
    setIsEditingIdentity(false);
  }, [worker]);

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

  const yearSummary = getYearSummary(worker.leaves);
  const yearSummaryEntries = (Object.entries(yearSummary) as [LeaveType, number][]).filter(
    ([, d]) => d > 0,
  );

  return (
    <AccordionCard
      label={worker.name}
      emptyLabel="Pracownik bez nazwy"
      icon={avatar}
      badge={badge}
      meta={meta}
      open={isOpen}
      onOpenChange={setIsOpen}
      onDelete={onDelete}
      deleteLabel="Usuń pracownika"
      confirmDelete={`Czy na pewno chcesz usunąć pracownika „${worker.name}"? Tej operacji nie można cofnąć.`}
      showDelete={isEditingIdentity}
      headerActions={
        !isEditingIdentity ? (
          <button
            type="button"
            className={styles.identityEditBtn}
            onClick={handleEditClick}
            title="Edytuj dane pracownika"
          >
            <IconPencil width="12" height="12" />
          </button>
        ) : undefined
      }
    >
      <div className={styles.workerBody}>
        {/* Edycja danych — widoczna tylko w trybie edycji */}
        {isEditingIdentity && (
          <div className={styles.identityEdit}>
            <div className={styles.fieldRow}>
              <Text
                variant="nano"
                as="span"
                weight="bold"
                color="muted"
                className={styles.fieldLabel}
              >
                Imię
              </Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldError ?? undefined}
                required
                aria-label="Imię i nazwisko"
                autoFocus
              />
            </div>
            <div className={styles.fieldRow}>
              <Text
                variant="nano"
                as="span"
                weight="bold"
                color="muted"
                className={styles.fieldLabel}
              >
                Rola
              </Text>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="np. Mechanik"
                aria-label="Stanowisko / rola"
              />
            </div>
            <div className={styles.identityEditActions}>
              <Button
                variant="primary"
                size="sm"
                type="button"
                loading={saving}
                onClick={handleSaveIdentity}
              >
                Zapisz
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                disabled={saving}
                onClick={handleCancelIdentity}
              >
                Anuluj
              </Button>
            </div>
          </div>
        )}

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

        {/* Urlopy — pełna szerokość */}
        <div className={styles.leavesSection}>
          <div className={styles.leavesSectionHead}>
            <Text variant="nano" as="span" weight="bold" color="muted">
              URLOPY
            </Text>
            {worker.leaves.length > 0 && (
              <Text variant="nano" as="span" color="muted" mono>
                {worker.leaves.length} zap.
              </Text>
            )}
          </div>
          <div className={styles.leaveList}>
            {/* Year summary */}
            {yearSummaryEntries.length > 0 && (
              <div className={styles.leaveSummary}>
                {yearSummaryEntries.map(([type, days]) => (
                  <span key={type} className={styles.leaveSummaryChip}>
                    <span
                      className={styles.leaveSummaryDot}
                      style={{ background: LEAVE_TYPE_COLORS[type] }}
                    />
                    <Text variant="nano" mono as="span">
                      {LEAVE_TYPE_LABELS[type]}: {days} {days === 1 ? 'dzień' : 'dni'}
                    </Text>
                  </span>
                ))}
              </div>
            )}

            {/* Leave table */}
            {worker.leaves.length > 0 && (
              <div className={styles.leaveTable}>
                {worker.leaves.map((leave) => {
                  const past = isPastLeave(leave.endDate);
                  const cancelled = softCancelledIds.has(leave.id);
                  return (
                    <div
                      key={leave.id}
                      className={`${styles.leaveTableRow} ${cancelled ? styles.leaveTableRowCancelled : ''} ${past && !cancelled ? styles.leaveTableRowPast : ''}`}
                    >
                      <span
                        className={styles.leaveTypeDot}
                        style={{ background: LEAVE_TYPE_COLORS[leave.type] }}
                      />
                      <div className={styles.leaveTableType}>
                        <Text variant="body-sm" weight="bold" as="span">
                          {LEAVE_TYPE_LABELS[leave.type]}
                        </Text>
                        {leave.note && (
                          <Text
                            variant="nano"
                            color="muted"
                            as="span"
                            className={styles.leaveTableNote}
                          >
                            {leave.note}
                          </Text>
                        )}
                        {cancelled && (
                          <Text variant="nano" color="secondary" as="span">
                            Anulowany
                          </Text>
                        )}
                      </div>
                      <Text
                        variant="nano"
                        mono
                        color="secondary"
                        as="span"
                        className={styles.leaveTableDate}
                      >
                        {formatDate(leave.startDate)}
                      </Text>
                      <Text
                        variant="nano"
                        mono
                        color="secondary"
                        as="span"
                        className={styles.leaveTableDate}
                      >
                        {formatDate(leave.endDate)}
                      </Text>
                      <Text
                        variant="nano"
                        mono
                        color="accent"
                        as="span"
                        className={styles.leaveTableDays}
                      >
                        {countDays(leave.startDate, leave.endDate)} dni
                      </Text>
                      <div className={styles.leaveActions}>
                        {!cancelled && !past && (
                          <button
                            type="button"
                            className={`${styles.leaveActionBtn} ${styles.leaveActionBtnEdit}`}
                            title="Edytuj nieobecność"
                            onClick={() => onEditLeave(leave)}
                            disabled={saving}
                          >
                            <IconPencil width="11" height="11" />
                          </button>
                        )}
                        {!cancelled && (
                          <button
                            type="button"
                            className={styles.leaveActionBtn}
                            title={past ? 'Oznacz jako anulowany' : 'Usuń nieobecność'}
                            disabled={saving}
                            onClick={() => {
                              if (past) {
                                setSoftCancelledIds((prev) => new Set(prev).add(leave.id));
                              } else {
                                onRemoveLeave(leave.id);
                              }
                            }}
                          >
                            <IconTrash width="11" height="11" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                <Combobox
                  label="Typ nieobecności"
                  options={LEAVE_TYPE_OPTIONS}
                  value={leaveForm.type}
                  onChange={(value) =>
                    setLeaveForm((prev) => ({ ...prev, type: value as LeaveType }))
                  }
                />
                <div className={styles.addLeaveFormRow}>
                  <DatePicker
                    label="Data początku"
                    value={leaveForm.startDate}
                    max={leaveForm.endDate || undefined}
                    onChange={(value) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        startDate: value,
                        endDate: prev.endDate && prev.endDate < value ? '' : prev.endDate,
                      }))
                    }
                    required
                  />
                  <DatePicker
                    label="Data końca"
                    value={leaveForm.endDate}
                    min={leaveForm.startDate || undefined}
                    onChange={(value) => setLeaveForm((prev) => ({ ...prev, endDate: value }))}
                    error={
                      leaveForm.startDate &&
                      leaveForm.endDate &&
                      leaveForm.endDate < leaveForm.startDate
                        ? 'Musi być po dacie początku'
                        : undefined
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
