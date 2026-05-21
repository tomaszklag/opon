'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, Text, TimeInput, Toggle } from '@opony/design-system-web';
import {
  IconXClose,
  IconPlus,
  IconUserAdd,
  IconAlertCircle,
  IconPencil,
  IconCheck,
} from '../../../../components/icons';
import { type Station, type DaySchedule } from '../../../../api-data-access/stations';
import { type Worker } from '../../../../api-data-access/workers';
import { AccordionCard } from '../../services/_components/AccordionCard';
import styles from '../stations.module.css';

export interface ServiceOption {
  id: string;
  name: string;
  enabled: boolean;
}

const DAY_LABELS: Record<number, string> = {
  1: 'PON',
  2: 'WT',
  3: 'ŚR',
  4: 'CZW',
  5: 'PT',
  6: 'SOB',
  0: 'ND',
};

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const AVATAR_COLORS = [
  styles.avatarOrange,
  styles.avatarBlue,
  styles.avatarGreen,
  styles.avatarPurple,
];

function getAvatarClass(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? styles.avatarOrange ?? '';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function toMins(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function detectOverlap(station: Station): { hasOverlap: boolean; overlapStr: string } {
  if (station.workers.length < 2) return { hasOverlap: false, overlapStr: '' };
  const shifts = station.workers
    .filter((w) => w.shiftStart && w.shiftEnd)
    .map((w) => ({ start: toMins(w.shiftStart!), end: toMins(w.shiftEnd!) }));

  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = shifts[i]!;
      const b = shifts[j]!;
      const overlapStart = Math.max(a.start, b.start);
      const overlapEnd = Math.min(a.end, b.end);
      if (overlapStart < overlapEnd) {
        const fmt = (mins: number) => {
          const hh = Math.floor(mins / 60)
            .toString()
            .padStart(2, '0');
          const mm = (mins % 60).toString().padStart(2, '0');
          return `${hh}:${mm}`;
        };
        return { hasOverlap: true, overlapStr: `${fmt(overlapStart)}–${fmt(overlapEnd)}` };
      }
    }
  }
  return { hasOverlap: false, overlapStr: '' };
}

interface Props {
  station: Station;
  availableServices: ServiceOption[];
  workers: Worker[];
  onUpdateName: (name: string) => void;
  onToggleService: (serviceId: string) => void;
  onUpdateSchedule: (schedule: DaySchedule[]) => void;
  onAssignWorker: (workerId: string) => void;
  onRemoveWorker: (workerId: string) => void;
  onDelete: () => void;
}

export function StationCard({
  station,
  availableServices,
  workers,
  onUpdateName,
  onToggleService,
  onUpdateSchedule,
  onAssignWorker,
  onRemoveWorker,
  onDelete,
}: Props) {
  const todayDow = new Date().getDay();

  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [nameVal, setNameVal] = useState(station.name);
  const [svcDropdown, setSvcDropdown] = useState(false);
  const svcWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svcDropdown) return;
    function onMouseDown(e: MouseEvent) {
      if (svcWrapRef.current && !svcWrapRef.current.contains(e.target as Node)) {
        setSvcDropdown(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [svcDropdown]);

  // Sync name input when station name changes externally
  useEffect(() => {
    setNameVal(station.name);
  }, [station.name]);

  function enterEdit() {
    setIsEditing(true);
    setIsOpen(true);
  }

  function exitEdit() {
    setIsEditing(false);
    setSvcDropdown(false);
  }

  const hasWorkers = station.workers.length > 0;
  const { hasOverlap, overlapStr } = detectOverlap(station);

  const assignedWorkerIds = new Set(station.workers.map((w) => w.workerId));
  const unassignedWorkerOptions = workers
    .filter((w) => !assignedWorkerIds.has(w.id))
    .map((w) => ({ value: w.id, label: w.name }));

  const schedMap = new Map<number, DaySchedule>();
  for (const d of station.schedule) {
    schedMap.set(d.dayOfWeek, d);
  }

  function getDay(dow: number): DaySchedule {
    return (
      schedMap.get(dow) ?? {
        dayOfWeek: dow as DaySchedule['dayOfWeek'],
        open: false,
        startTime: '08:00',
        endTime: '17:00',
      }
    );
  }

  function handleToggleDay(dow: number) {
    const current = getDay(dow);
    if (!schedMap.has(dow)) {
      onUpdateSchedule([
        ...station.schedule,
        {
          dayOfWeek: dow as DaySchedule['dayOfWeek'],
          open: true,
          startTime: '08:00',
          endTime: '17:00',
        },
      ]);
    } else {
      onUpdateSchedule(
        station.schedule.map((d) => (d.dayOfWeek === dow ? { ...d, open: !current.open } : d)),
      );
    }
  }

  function handleTimeChange(dow: number, field: 'startTime' | 'endTime', value: string) {
    onUpdateSchedule(
      station.schedule.map((d) => (d.dayOfWeek === dow ? { ...d, [field]: value } : d)),
    );
  }

  function handleNameBlur() {
    if (nameVal.trim() !== station.name) {
      onUpdateName(nameVal.trim() || station.name);
    }
  }

  // ── Header slot elements ──────────────────────────────────────────────────

  const avatarStack = (
    <div className={styles.avatarStack}>
      {hasWorkers ? (
        station.workers.slice(0, 3).map((w, i) => (
          <div
            key={w.workerId}
            className={[styles.workerAvatar, getAvatarClass(i)].join(' ')}
            title={w.workerName}
          >
            {getInitials(w.workerName)}
          </div>
        ))
      ) : (
        <div className={[styles.workerAvatar, styles.avatarEmpty].join(' ')}>
          <IconUserAdd width="14" height="14" />
        </div>
      )}
    </div>
  );

  // ── Leave coverage ───────────────────────────────────────────────────────
  const todayISO = new Date().toISOString().slice(0, 10);

  const workerMap = new Map(workers.map((w) => [w.id, w]));

  const workersOnLeaveToday = station.workers.filter((sw) => {
    const w = workerMap.get(sw.workerId);
    if (!w) return false;
    return w.leaves.some((l) => {
      const start = (l.startDate as unknown as string).slice(0, 10);
      const end = (l.endDate as unknown as string).slice(0, 10);
      return start <= todayISO && todayISO <= end;
    });
  });

  const leaveToday = workersOnLeaveToday.length;
  const allOnLeaveToday = leaveToday > 0 && leaveToday === station.workers.length;
  const someOnLeaveToday = leaveToday > 0 && !allOnLeaveToday;

  const leaveWarning = allOnLeaveToday ? (
    <span className={styles.leaveWarnFull}>
      <IconAlertCircle width="10" height="10" />
      <Text variant="nano" as="span" weight="bold">
        Brak obsady
      </Text>
    </span>
  ) : someOnLeaveToday ? (
    <span className={styles.leaveWarnPartial}>
      <IconAlertCircle width="10" height="10" />
      <Text variant="nano" as="span" weight="bold">
        {workersOnLeaveToday.map((sw) => sw.workerName.split(' ')[0]).join(', ')} na urlopie
      </Text>
    </span>
  ) : null;

  const assignedCount = station.serviceIds.length;
  const totalCount = availableServices.length;
  const serviceBadge =
    assignedCount === 0 ? (
      <Text variant="nano" as="span" color="muted">
        brak usług
      </Text>
    ) : assignedCount <= 2 ? (
      <Text variant="nano" as="span" color="accent" weight="bold">
        {station.serviceIds
          .map((id) => availableServices.find((s) => s.id === id)?.name ?? 'Usługa')
          .join(' · ')}
      </Text>
    ) : (
      <Text variant="nano" as="span" color="accent" weight="bold" mono>
        {assignedCount}&thinsp;/&thinsp;{totalCount} usług
      </Text>
    );

  const editBtn = (
    <Button
      variant={isEditing ? 'primary' : 'ghost'}
      size="sm"
      onClick={isEditing ? exitEdit : enterEdit}
    >
      {isEditing ? (
        <>
          <IconCheck width="11" height="11" /> Gotowe
        </>
      ) : (
        <>
          <IconPencil width="11" height="11" /> Edytuj
        </>
      )}
    </Button>
  );

  // ── Read-only body ────────────────────────────────────────────────────────

  const readBody = (
    <div className={styles.cardBody}>
      {/* Workers */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Pracownicy
        </Text>
        <div className={styles.workersList}>
          {station.workers.length === 0 ? (
            <Text variant="nano" color="muted" as="span">
              Brak przypisanych pracowników
            </Text>
          ) : (
            station.workers.map((w, i) => (
              <div key={w.workerId} className={styles.workerTag}>
                <div
                  className={[styles.workerAvatar, styles.workerTagAvatar, getAvatarClass(i)].join(
                    ' ',
                  )}
                >
                  {getInitials(w.workerName)}
                </div>
                <div className={styles.workerTagInfo}>
                  <Text variant="body-sm" as="span" weight="bold">
                    {w.workerName}
                  </Text>
                  {w.shiftStart && w.shiftEnd ? (
                    <Text variant="nano" as="span" color="muted" mono>
                      {w.shiftStart}–{w.shiftEnd}
                    </Text>
                  ) : (
                    <Text variant="nano" as="span" color="muted">
                      Brak godzin zmiany
                    </Text>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Services */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Usługi
        </Text>
        {station.serviceIds.length === 0 ? (
          <Text variant="nano" as="span" color="muted">
            Brak usług
          </Text>
        ) : (
          <div className={styles.chips}>
            {station.serviceIds.map((id) => {
              const svc = availableServices.find((s) => s.id === id);
              if (!svc) return null;
              return (
                <span
                  key={id}
                  className={`${styles.chip}${!svc.enabled ? ' ' + styles.chipDisabled : ''}`}
                >
                  <Text variant="nano" as="span">
                    {svc.name}
                  </Text>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule read-only */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Grafik
        </Text>
        <div className={styles.schedGridRead}>
          {DISPLAY_ORDER.map((dow) => {
            const day = getDay(dow);
            return (
              <div
                key={dow}
                className={[styles.schedRowRead, dow === todayDow ? styles.schedRowToday : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  mono
                  color={dow === todayDow ? 'accent' : 'muted'}
                >
                  {DAY_LABELS[dow]}
                </Text>
                {day.open ? (
                  <Text variant="nano" as="span" mono color="secondary">
                    {day.startTime}–{day.endTime}
                  </Text>
                ) : (
                  <Text variant="nano" as="span" color="muted">
                    wolne
                  </Text>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Edit body ─────────────────────────────────────────────────────────────

  const editBody = (
    <div className={styles.cardBody}>
      {/* Name */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Nazwa
        </Text>
        <Input
          type="text"
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onBlur={handleNameBlur}
          aria-label="Nazwa stanowiska"
        />
      </div>

      {/* Workers */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Pracownicy
        </Text>
        <div className={styles.workersList}>
          {station.workers.map((w, i) => (
            <div key={w.workerId} className={styles.workerTag}>
              <div
                className={[styles.workerAvatar, styles.workerTagAvatar, getAvatarClass(i)].join(
                  ' ',
                )}
              >
                {getInitials(w.workerName)}
              </div>
              <div className={styles.workerTagInfo}>
                <Text variant="body-sm" as="span" weight="bold">
                  {w.workerName}
                </Text>
                {w.shiftStart && w.shiftEnd ? (
                  <Text variant="nano" as="span" color="muted" mono>
                    {w.shiftStart}–{w.shiftEnd}
                  </Text>
                ) : (
                  <Text variant="nano" as="span" color="muted">
                    Brak godzin zmiany
                  </Text>
                )}
              </div>
              <button
                className={styles.removeWorkerBtn}
                onClick={() => onRemoveWorker(w.workerId)}
                aria-label={`Usuń ${w.workerName}`}
              >
                <IconXClose width="12" height="12" />
              </button>
            </div>
          ))}
          {unassignedWorkerOptions.length > 0 && (
            <div className={styles.workerPool}>
              <Text variant="nano" color="muted" as="span">
                Dodaj:
              </Text>
              <div className={styles.workerPoolChips}>
                {unassignedWorkerOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={styles.workerPoolChip}
                    onClick={() => onAssignWorker(opt.value)}
                  >
                    <Text variant="nano" weight="bold" color="accent" as="span">
                      + {opt.label}
                    </Text>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlap warning */}
      {hasOverlap && (
        <div className={styles.overlapNote}>
          <IconAlertCircle width="12" height="12" className={styles.overlapNoteIcon} />
          <Text variant="nano" as="span" className={styles.overlapNoteText}>
            Nakładające się zmiany {overlapStr} —{' '}
            <strong>stanowisko obsługuje 1 rezerwację naraz</strong>, niezależnie od liczby
            pracowników. Slot engine blokuje drugie okno automatycznie.
          </Text>
        </div>
      )}

      {/* Services */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Usługi
        </Text>
        {availableServices.length === 0 ? (
          <Text variant="nano" as="span" color="muted">
            Brak usług — dodaj je w{' '}
            <a href="/dashboard/services" className={styles.inlineLink}>
              Usługi &amp; Cennik
            </a>
            .
          </Text>
        ) : (
          <div className={styles.chips}>
            {station.serviceIds.map((id) => {
              const svc = availableServices.find((s) => s.id === id);
              if (!svc) return null;
              return (
                <span
                  key={id}
                  className={`${styles.chip}${!svc.enabled ? ' ' + styles.chipDisabled : ''}`}
                >
                  <Text variant="nano" as="span">
                    {svc.name}
                  </Text>
                  <button
                    className={styles.chipX}
                    onClick={() => onToggleService(id)}
                    aria-label={`Usuń ${svc.name}`}
                  >
                    <IconXClose width="8" height="8" />
                  </button>
                </span>
              );
            })}
            {station.serviceIds.length < availableServices.length && (
              <div className={styles.chipAddWrap} ref={svcWrapRef}>
                <button
                  className={styles.chipAdd}
                  onClick={() => setSvcDropdown((v) => !v)}
                  aria-label="Dodaj usługę"
                  aria-expanded={svcDropdown}
                >
                  <IconPlus width="7" height="7" />
                </button>
                {svcDropdown && (
                  <div className={styles.svcDropdown}>
                    {availableServices
                      .filter((s) => !station.serviceIds.includes(s.id))
                      .map((s) => (
                        <button
                          key={s.id}
                          className={`${styles.svcOption}${!s.enabled ? ' ' + styles.svcOptionDisabled : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onToggleService(s.id);
                            setSvcDropdown(false);
                          }}
                        >
                          <Text variant="nano" as="span">
                            {s.name}
                          </Text>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className={styles.fieldRow}>
        <Text variant="nano" as="span" weight="bold" className={styles.fieldLabel} color="muted">
          Grafik
        </Text>
        <div className={styles.schedGrid}>
          {DISPLAY_ORDER.map((dow) => {
            const day = getDay(dow);
            return (
              <div
                key={dow}
                className={[
                  styles.schedRow,
                  !day.open ? styles.schedRowClosed : '',
                  dow === todayDow ? styles.schedRowToday : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                  }}
                >
                  <Text
                    variant="nano"
                    as="span"
                    weight="bold"
                    mono
                    color={dow === todayDow ? 'accent' : undefined}
                  >
                    {DAY_LABELS[dow]}
                  </Text>
                  {dow === todayDow && <span className={styles.todayTag}>Dziś</span>}
                </div>
                {day.open ? (
                  <>
                    <TimeInput
                      label="Od"
                      value={day.startTime}
                      onChange={(v) => handleTimeChange(dow, 'startTime', v)}
                      aria-label={`${DAY_LABELS[dow]} od`}
                    />
                    <TimeInput
                      label="Do"
                      value={day.endTime}
                      onChange={(v) => handleTimeChange(dow, 'endTime', v)}
                      aria-label={`${DAY_LABELS[dow]} do`}
                    />
                    <Text variant="nano" as="span" color="muted" mono>
                      {(() => {
                        const startM = toMins(day.startTime);
                        const endM = toMins(day.endTime);
                        const diff = endM - startM;
                        if (diff <= 0) return '';
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        return m > 0 ? `${h}h ${m}m` : `${h} h`;
                      })()}
                    </Text>
                  </>
                ) : (
                  <Text
                    variant="nano"
                    as="span"
                    color="muted"
                    className={styles.schedClosedLabel}
                    style={{ gridColumn: '2 / 5' }}
                  >
                    — wolne —
                  </Text>
                )}
                <Toggle
                  size="sm"
                  checked={day.open}
                  onChange={() => handleToggleDay(dow)}
                  aria-label={`${DAY_LABELS[dow]} aktywny`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <AccordionCard
      label={station.name}
      emptyLabel="Stanowisko bez nazwy"
      icon={avatarStack}
      badge={serviceBadge}
      meta={leaveWarning ?? undefined}
      open={isOpen}
      onOpenChange={setIsOpen}
      onDelete={onDelete}
      deleteLabel="Usuń stanowisko"
      confirmDelete={`Czy na pewno chcesz usunąć stanowisko „${station.name}"? Tej operacji nie można cofnąć.`}
      showDelete={isEditing}
      headerActions={editBtn}
    >
      {isEditing ? editBody : readBody}
    </AccordionCard>
  );
}
