'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Combobox, Heading, Input, Text } from '@opony/design-system-web';
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconInfo,
  IconPencil,
  IconPlus,
  IconTrash,
  IconXClose,
} from '../../../../components/icons';
import type { Worker } from '../../../../lib/hooks/use-workers';
import type { Station } from '../../../../api-data-access/stations';
import { HOLIDAY_MAP, getUpcomingHolidays } from '../../../../lib/holidays';
import styles from '../workers.module.css';

interface Props {
  workers: Worker[];
  stations: Station[];
  saving: boolean;
  onRequestAddLeave: (workerId: string) => void;
  onUpdateWorker: (id: string, patch: { name: string; role?: string }) => Promise<void>;
  onCreateWorker: (name: string, role?: string) => Promise<void>;
  onDeleteWorker: (id: string) => Promise<void>;
  onAssignStation: (workerId: string, stationId: string) => Promise<void>;
  onRemoveStation: (workerId: string, stationId: string) => Promise<void>;
}

// ── constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

const LEAVE_TYPE_COLORS: Record<string, string> = {
  VACATION: 'var(--accent)',
  SICK: 'var(--warning)',
  UNPAID: '#A855F7',
  OTHER: 'var(--text-muted)',
};

const LEAVE_TYPE_LABELS: Record<string, string> = {
  VACATION: 'Urlop',
  SICK: 'Chorobowe',
  UNPAID: 'Bezpłatny',
  OTHER: 'Inna',
};

const NAME_W = 148;
const DAY_W = 14;
const BTN_W = 28;

// ── helpers ───────────────────────────────────────────────────────────────────

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

interface DayInfo {
  iso: string;
  dayNum: number;
  isToday: boolean;
  isWeekend: boolean;
  isMonthStart: boolean;
  isMonday: boolean;
  weekParity: 0 | 1;
  isHoliday: boolean;
  holidayName: string;
}

interface MonthMeta {
  year: number;
  month: number;
  count: number;
}

function buildRange(
  year: number,
  month: number,
): { days: DayInfo[]; m0: MonthMeta; m1: MonthMeta } {
  const todayISO = toISO(new Date());
  const days: DayInfo[] = [];

  function pushMonth(y: number, m: number) {
    const count = getDaysInMonth(y, m);
    for (let d = 1; d <= count; d++) {
      const date = new Date(y, m, d);
      const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = date.getDay();
      const holidayName = HOLIDAY_MAP.get(iso) ?? '';
      days.push({
        iso,
        dayNum: d,
        isToday: iso === todayISO,
        isWeekend: dow === 0 || dow === 6,
        isMonthStart: d === 1,
        isMonday: dow === 1,
        weekParity: 0,
        isHoliday: holidayName !== '',
        holidayName,
      });
    }
  }

  pushMonth(year, month);
  const next = new Date(year, month + 1, 1);
  pushMonth(next.getFullYear(), next.getMonth());

  return {
    days,
    m0: { year, month, count: getDaysInMonth(year, month) },
    m1: {
      year: next.getFullYear(),
      month: next.getMonth(),
      count: getDaysInMonth(next.getFullYear(), next.getMonth()),
    },
  };
}

function getLeaveColorMap(worker: Worker): Map<string, { color: string; title: string }> {
  const map = new Map<string, { color: string; title: string }>();
  for (const leave of worker.leaves) {
    const color = LEAVE_TYPE_COLORS[leave.type] ?? 'var(--text-muted)';
    const label = LEAVE_TYPE_LABELS[leave.type] ?? leave.type;
    const title = `${label}: ${leave.startDate.slice(0, 10)} – ${leave.endDate.slice(0, 10)}`;
    const cursor = new Date(toDate(leave.startDate));
    const end = toDate(leave.endDate);
    while (cursor <= end) {
      map.set(toISO(cursor), { color, title });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return map;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  const months = [
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
  return `${parseInt(d ?? '1')} ${months[parseInt(m ?? '1') - 1] ?? ''}`;
}

type UpcomingItem =
  | { kind: 'leave'; date: string; workerName: string; leaveType: string; days: number }
  | { kind: 'holiday'; date: string; name: string };

function UpcomingWidget({ workers }: { workers: Worker[] }) {
  const today = new Date().toISOString().slice(0, 10);

  const leaves: UpcomingItem[] = workers.flatMap((w) =>
    w.leaves
      .filter((l) => l.endDate.slice(0, 10) >= today)
      .map((l) => ({
        kind: 'leave' as const,
        date: l.startDate.slice(0, 10),
        workerName: w.name,
        leaveType: l.type,
        days:
          Math.round(
            (new Date(l.endDate.slice(0, 10) + 'T00:00:00').getTime() -
              new Date(l.startDate.slice(0, 10) + 'T00:00:00').getTime()) /
              86400000,
          ) + 1,
      })),
  );

  const holidays: UpcomingItem[] = getUpcomingHolidays(6).map((h) => ({
    kind: 'holiday' as const,
    date: h.date,
    name: h.name,
  }));

  const items = [...leaves, ...holidays].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 8);

  if (items.length === 0) return null;

  return (
    <div className={styles.upcomingWidget}>
      <Text
        variant="nano"
        weight="bold"
        color="muted"
        as="p"
        className={styles.upcomingWidgetTitle}
      >
        Nadchodzące
      </Text>
      <div className={styles.upcomingList}>
        {items.map((item, i) => (
          <div key={i} className={styles.upcomingItem}>
            <Text variant="nano" mono color="muted" as="span" className={styles.upcomingDate}>
              {fmtDate(item.date)}
            </Text>
            <span
              className={styles.upcomingDot}
              style={{
                background:
                  item.kind === 'holiday'
                    ? 'var(--warning)'
                    : (LEAVE_TYPE_COLORS[item.leaveType] ?? 'var(--text-muted)'),
              }}
            />
            <div className={styles.upcomingInfo}>
              <Text variant="nano" weight="bold" color="secondary" as="span">
                {item.kind === 'holiday' ? item.name : item.workerName}
              </Text>
              {item.kind === 'leave' && (
                <Text variant="nano" color="muted" as="span">
                  {LEAVE_TYPE_LABELS[item.leaveType] ?? item.leaveType}
                  {item.days > 1 ? ` · ${item.days} dni` : ''}
                </Text>
              )}
              {item.kind === 'holiday' && (
                <Text variant="nano" color="muted" as="span">
                  święto
                </Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

interface EditPopup {
  workerId: string;
  name: string;
  role: string;
  top: number;
}

type LeavesFilter = 'all' | 'upcoming' | 'past';

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function leaveStatus(leave: Worker['leaves'][0]): 'active' | 'upcoming' | 'past' {
  const today = todayISO();
  const start = leave.startDate.slice(0, 10);
  const end = leave.endDate.slice(0, 10);
  if (end < today) return 'past';
  if (start > today) return 'upcoming';
  return 'active';
}

function leaveDays(leave: Worker['leaves'][0]): number {
  const start = new Date(leave.startDate.slice(0, 10) + 'T00:00:00');
  const end = new Date(leave.endDate.slice(0, 10) + 'T00:00:00');
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
}

export function AbsenceTimeline({
  workers,
  stations,
  saving,
  onRequestAddLeave,
  onUpdateWorker,
  onCreateWorker,
  onDeleteWorker,
  onAssignStation,
  onRemoveStation,
}: Props) {
  const now = new Date();
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());

  // Edit popup state
  const [editPopup, setEditPopup] = useState<EditPopup | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Leaves popup state
  const [leavesPopup, setLeavesPopup] = useState<{ workerId: string; top: number } | null>(null);
  const [leavesFilter, setLeavesFilter] = useState<LeavesFilter>('all');
  const leavesPopupRef = useRef<HTMLDivElement>(null);

  const [stationsSaving, setStationsSaving] = useState(false);
  const [addStationVal, setAddStationVal] = useState('');

  // Create worker state
  const [isCreating, setIsCreating] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createRole, setCreateRole] = useState('');

  const { days, m0, m1 } = useMemo(
    () => buildRange(displayYear, displayMonth),
    [displayYear, displayMonth],
  );

  const workerMaps = useMemo(
    () => workers.map((w) => ({ worker: w, colorMap: getLeaveColorMap(w) })),
    [workers],
  );

  // Close edit popup on outside click
  useEffect(() => {
    if (!editPopup) return;
    function onMouseDown(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setEditPopup(null);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [editPopup]);

  // Close leaves popup on outside click
  useEffect(() => {
    if (!leavesPopup) return;
    function onMouseDown(e: MouseEvent) {
      if (leavesPopupRef.current && !leavesPopupRef.current.contains(e.target as Node)) {
        setLeavesPopup(null);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [leavesPopup]);

  function prevMonth() {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else setDisplayMonth((m) => m - 1);
  }
  function nextMonth() {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else setDisplayMonth((m) => m + 1);
  }

  function openLeavesPopup(worker: Worker, anchorEl: HTMLElement) {
    const rect = anchorEl.getBoundingClientRect();
    setLeavesPopup({ workerId: worker.id, top: rect.top });
    setLeavesFilter('all');
    setEditPopup(null);
    setConfirmingDelete(false);
  }

  function openEditPopup(worker: Worker, anchorEl: HTMLElement) {
    const rect = anchorEl.getBoundingClientRect();
    setEditPopup({
      workerId: worker.id,
      name: worker.name,
      role: worker.role ?? '',
      top: rect.top,
    });
    setConfirmingDelete(false);
    setLeavesPopup(null);
  }

  async function saveEdit() {
    if (!editPopup || !editPopup.name.trim()) return;
    await onUpdateWorker(editPopup.workerId, {
      name: editPopup.name.trim(),
      role: editPopup.role.trim() || undefined,
    });
    setEditPopup(null);
  }

  async function handleDeleteWorker() {
    if (!editPopup) return;
    await onDeleteWorker(editPopup.workerId);
    setEditPopup(null);
    setConfirmingDelete(false);
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    await onCreateWorker(createName.trim(), createRole.trim() || undefined);
    setCreateName('');
    setCreateRole('');
    setIsCreating(false);
  }

  const isAtMin = displayYear === now.getFullYear() && displayMonth === now.getMonth();
  const m0Start = 2;
  const m1Start = 2 + m0.count;
  const gridCols = `${NAME_W}px repeat(${days.length}, ${DAY_W}px) ${BTN_W}px`;

  // ── Leaves popup portal ───────────────────────────────────────────────────

  const leavesWorker = leavesPopup ? workers.find((w) => w.id === leavesPopup.workerId) : null;

  const leavesPanel =
    leavesPopup && leavesWorker
      ? createPortal(
          <div
            ref={leavesPopupRef}
            className={styles.leavesPopup}
            style={{ position: 'fixed', top: leavesPopup.top, left: NAME_W + 10, zIndex: 9998 }}
          >
            {/* Header */}
            <div className={styles.leavesPopupHead}>
              <div>
                <Text variant="body-sm" weight="bold" as="span">
                  {leavesWorker.name}
                </Text>
                {leavesWorker.role && (
                  <Text variant="nano" color="muted" as="p">
                    {leavesWorker.role}
                  </Text>
                )}
              </div>
              <button className={styles.leavesPopupClose} onClick={() => setLeavesPopup(null)}>
                <IconXClose width="12" height="12" />
              </button>
            </div>

            {/* Filter pills */}
            <div className={styles.leavesFilterBar}>
              {(['all', 'upcoming', 'past'] as const).map((f) => (
                <button
                  key={f}
                  className={`${styles.leavesFilterPill} ${leavesFilter === f ? styles.leavesFilterPillActive : ''}`}
                  onClick={() => setLeavesFilter(f)}
                >
                  <Text variant="nano" weight="bold" as="span">
                    {f === 'all' ? 'Wszystkie' : f === 'upcoming' ? 'Nadchodzące' : 'Przeszłe'}
                  </Text>
                </button>
              ))}
            </div>

            {/* Leave list */}
            <div className={styles.leavesPopupBody}>
              {(() => {
                const filtered = leavesWorker.leaves
                  .filter((l) => {
                    const s = leaveStatus(l);
                    if (leavesFilter === 'upcoming') return s === 'upcoming' || s === 'active';
                    if (leavesFilter === 'past') return s === 'past';
                    return true;
                  })
                  .sort((a, b) => {
                    const sa = leaveStatus(a),
                      sb = leaveStatus(b);
                    const order = { active: 0, upcoming: 1, past: 2 };
                    if (order[sa] !== order[sb]) return order[sa] - order[sb];
                    if (sa === 'past') return b.endDate.localeCompare(a.endDate);
                    return a.startDate.localeCompare(b.startDate);
                  });

                if (filtered.length === 0) {
                  return (
                    <div className={styles.leavesPopupEmpty}>
                      <Text variant="nano" color="muted" as="span">
                        Brak nieobecności
                      </Text>
                    </div>
                  );
                }

                return filtered.map((leave) => {
                  const status = leaveStatus(leave);
                  const days = leaveDays(leave);
                  const color = LEAVE_TYPE_COLORS[leave.type] ?? 'var(--text-muted)';
                  return (
                    <div
                      key={leave.id}
                      className={[
                        styles.leavesPopupItem,
                        status === 'past' ? styles.leavesPopupItemPast : '',
                        status === 'active' ? styles.leavesPopupItemActive : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className={styles.leavesPopupDot} style={{ background: color }} />
                      <div className={styles.leavesPopupItemInfo}>
                        <div className={styles.leavesPopupItemRow}>
                          <Text variant="nano" weight="bold" as="span">
                            {LEAVE_TYPE_LABELS[leave.type] ?? leave.type}
                          </Text>
                          <Text variant="nano" mono color="muted" as="span">
                            {days} {days === 1 ? 'dzień' : 'dni'}
                          </Text>
                        </div>
                        <Text variant="nano" mono color="muted" as="span">
                          {leave.startDate.slice(0, 10)} – {leave.endDate.slice(0, 10)}
                        </Text>
                        {leave.note && (
                          <Text
                            variant="nano"
                            color="secondary"
                            as="span"
                            className={styles.leavesPopupNote}
                          >
                            {leave.note}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className={styles.leavesPopupFooter}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLeavesPopup(null);
                  onRequestAddLeave(leavesWorker.id);
                }}
              >
                <IconPlus width="10" height="10" />
                Dodaj nieobecność
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  // ── Edit popup portal ─────────────────────────────────────────────────────

  const editWorker = editPopup ? workers.find((w) => w.id === editPopup.workerId) : null;
  const assignedStationIds = new Set(editWorker?.stations.map((s) => s.stationId) ?? []);
  const unassignedStations = stations
    .filter((s) => !assignedStationIds.has(s.id))
    .map((s) => ({ value: s.id, label: s.name }));

  const editPanel = editPopup
    ? createPortal(
        <div
          ref={popupRef}
          className={styles.workerEditPanel}
          style={{ position: 'fixed', top: editPopup.top, left: NAME_W + 10, zIndex: 9999 }}
        >
          <Input
            label="Imię i nazwisko"
            value={editPopup.name}
            autoFocus
            onChange={(e) =>
              setEditPopup((prev) => (prev ? { ...prev, name: e.target.value } : null))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setEditPopup(null);
            }}
          />
          <Input
            label="Rola"
            value={editPopup.role}
            placeholder="opcjonalne"
            onChange={(e) =>
              setEditPopup((prev) => (prev ? { ...prev, role: e.target.value } : null))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') setEditPopup(null);
            }}
          />

          {/* Stations */}
          {stations.length > 0 && (
            <div className={styles.editStationsSection}>
              <Text variant="nano" weight="bold" color="muted" as="span">
                Stanowiska
              </Text>
              <div className={styles.editStationTags}>
                {editWorker?.stations.map((s) => (
                  <span key={s.stationId} className={styles.editStationTag}>
                    <Text variant="nano" as="span">
                      {s.stationName}
                    </Text>
                    <button
                      className={styles.editStationTagX}
                      disabled={stationsSaving}
                      onClick={async () => {
                        setStationsSaving(true);
                        try {
                          await onRemoveStation(editPopup.workerId, s.stationId);
                        } finally {
                          setStationsSaving(false);
                        }
                      }}
                      aria-label={`Odepnij ${s.stationName}`}
                    >
                      <IconXClose width="8" height="8" />
                    </button>
                  </span>
                ))}
                {unassignedStations.length > 0 && (
                  <Combobox
                    value={addStationVal}
                    onChange={async (val) => {
                      if (!val) return;
                      setAddStationVal('');
                      setStationsSaving(true);
                      try {
                        await onAssignStation(editPopup.workerId, val);
                      } finally {
                        setStationsSaving(false);
                      }
                    }}
                    options={unassignedStations}
                    placeholder="+ Przypisz"
                  />
                )}
              </div>
            </div>
          )}

          <div className={styles.workerEditBtns}>
            {!confirmingDelete ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={saveEdit}
                  disabled={!editPopup.name.trim() || saving}
                >
                  <IconCheck width="12" height="12" />
                  Zapisz
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditPopup(null)}>
                  Anuluj
                </Button>
                <button
                  className={styles.workerDeleteBtn}
                  onClick={() => setConfirmingDelete(true)}
                  title="Usuń pracownika"
                >
                  <IconTrash width="12" height="12" />
                </button>
              </>
            ) : (
              <>
                <Text variant="nano" as="span" color="secondary">
                  Usunąć pracownika?
                </Text>
                <Button variant="danger" size="sm" onClick={handleDeleteWorker} disabled={saving}>
                  Usuń
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                  <IconXClose width="12" height="12" />
                </Button>
              </>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.timelineSection}>
      {/* Header */}
      <div className={styles.previewHead}>
        <Heading variant="subsection" as="h3">
          Nieobecności
        </Heading>
        <div className={styles.tlNav}>
          <button
            type="button"
            className={styles.tlNavBtn}
            onClick={prevMonth}
            disabled={isAtMin}
            title="Poprzednie miesiące"
          >
            <IconChevronLeft width="12" height="12" />
          </button>
          <Text variant="nano" as="span" mono color="muted">
            {MONTH_NAMES[m0.month]}
            {m0.year !== m1.year ? ` ${m0.year}` : ''}
            {' – '}
            {MONTH_NAMES[m1.month]} {m1.year}
          </Text>
          <button
            type="button"
            className={styles.tlNavBtn}
            onClick={nextMonth}
            title="Następne miesiące"
          >
            <IconChevronRight width="12" height="12" />
          </button>
        </div>
      </div>

      {/* Body: grid + sidebar */}
      <div className={styles.tlBody}>
        <div className={styles.tlMain}>
          {/* Day grid */}
          <div className={styles.dayGridWrap}>
            <div className={styles.dayGrid} style={{ gridTemplateColumns: gridCols }}>
              {/* ── Month headers ── */}
              <div className={styles.dgNameHdr} />
              <div
                className={styles.dgMonthHdr}
                style={{ gridColumn: `${m0Start} / span ${m0.count}` }}
              >
                <Text variant="nano" weight="bold" color="secondary" as="span">
                  {MONTH_NAMES[m0.month]} {m0.year}
                </Text>
              </div>
              <div
                className={`${styles.dgMonthHdr} ${styles.dgMonthHdr2}`}
                style={{ gridColumn: `${m1Start} / span ${m1.count}` }}
              >
                <Text variant="nano" weight="bold" color="secondary" as="span">
                  {MONTH_NAMES[m1.month]} {m1.year}
                </Text>
              </div>
              <div />

              {/* ── Day numbers ── */}
              <div className={styles.dgNameHdr} />
              {days.map((d) => (
                <div
                  key={d.iso}
                  className={[
                    styles.dgDayNum,
                    d.isMonthStart ? styles.dgCellMonthStart : '',
                    d.isWeekend ? styles.dgDayNumWeekend : '',
                    d.isHoliday ? styles.dgDayNumHoliday : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={d.isHoliday ? d.holidayName : undefined}
                >
                  {(d.isMonthStart || d.isMonday || d.isToday) && (
                    <Text
                      variant="nano"
                      as="span"
                      color={d.isToday ? 'accent' : d.isHoliday ? 'secondary' : 'muted'}
                      weight={d.isToday || d.isHoliday ? 'bold' : undefined}
                    >
                      {d.dayNum}
                    </Text>
                  )}
                  {d.isHoliday && <span className={styles.dgHolidayFlag} />}
                </div>
              ))}
              <div />

              {/* ── Worker rows ── */}
              {workerMaps.map(({ worker, colorMap }) => (
                <React.Fragment key={worker.id}>
                  {/* Sticky name cell */}
                  <div className={`${styles.dgName} ${styles.dgNameSticky}`}>
                    <div
                      className={styles.workerInfo}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openLeavesPopup(worker, e.currentTarget)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && openLeavesPopup(worker, e.currentTarget)
                      }
                      title={`Nieobecności — ${worker.name}`}
                    >
                      <Text variant="nano" weight="bold" color="secondary" as="span">
                        {worker.name}
                      </Text>
                      {worker.role && (
                        <Text variant="nano" color="muted" as="span">
                          {worker.role}
                        </Text>
                      )}
                    </div>
                    <button
                      className={styles.workerEditBtn}
                      onClick={(e) => openEditPopup(worker, e.currentTarget)}
                      title={`Edytuj ${worker.name}`}
                    >
                      <IconPencil width="10" height="10" />
                    </button>
                  </div>

                  {/* Day cells */}
                  {days.map((d) => {
                    const leave = colorMap.get(d.iso);
                    return (
                      <div
                        key={d.iso}
                        className={[
                          styles.dgCell,
                          d.isToday ? styles.dgCellToday : '',
                          d.isWeekend ? styles.dgCellWeekend : '',
                          d.isHoliday ? styles.dgCellHoliday : '',
                          d.isMonthStart ? styles.dgCellMonthStart : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        title={leave?.title ?? (d.isHoliday ? d.holidayName : undefined)}
                      >
                        {leave && (
                          <div className={styles.dgFill} style={{ background: leave.color }} />
                        )}
                      </div>
                    );
                  })}

                  {/* Add leave button */}
                  <button
                    type="button"
                    className={styles.tlAddBtn}
                    onClick={() => onRequestAddLeave(worker.id)}
                    title={`Dodaj nieobecność — ${worker.name}`}
                  >
                    <IconPlus width="10" height="10" />
                  </button>
                </React.Fragment>
              ))}

              {/* ── Coverage row ── */}
              <div className={`${styles.dgName} ${styles.dgNameSticky}`}>
                <Text variant="nano" weight="bold" color="muted" as="span">
                  Obsada
                </Text>
              </div>
              {days.map((d) => {
                const absentCount = workerMaps.filter(({ colorMap }) => colorMap.has(d.iso)).length;
                const total = workers.length;
                const ratio = total > 0 ? (total - absentCount) / total : 1;
                const covColor =
                  absentCount === 0
                    ? undefined
                    : ratio > 0.5
                      ? 'var(--warning-muted)'
                      : 'var(--danger-muted)';
                return (
                  <div
                    key={d.iso}
                    className={[
                      styles.dgCell,
                      styles.dgCovCell,
                      d.isToday ? styles.dgCellToday : '',
                      d.isWeekend ? styles.dgCellWeekend : '',
                      d.isHoliday ? styles.dgCellHoliday : '',
                      d.isMonthStart ? styles.dgCellMonthStart : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {covColor && <div className={styles.dgFill} style={{ background: covColor }} />}
                  </div>
                );
              })}
              <div />
            </div>
          </div>

          {/* Add worker section */}
          {!isCreating ? (
            <button className={styles.addWorkerRowBtn} onClick={() => setIsCreating(true)}>
              <IconPlus width="10" height="10" />
              <Text variant="nano" weight="bold" color="accent" as="span">
                Dodaj pracownika
              </Text>
            </button>
          ) : (
            <div className={styles.workerCreateForm}>
              <Input
                label="Imię i nazwisko"
                value={createName}
                autoFocus
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setCreateName('');
                    setCreateRole('');
                  }
                }}
              />
              <Input
                label="Rola"
                value={createRole}
                placeholder="opcjonalne"
                onChange={(e) => setCreateRole(e.target.value)}
              />
              <div className={styles.workerCreateBtns}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreate}
                  disabled={!createName.trim() || saving}
                >
                  Dodaj pracownika
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setCreateName('');
                    setCreateRole('');
                  }}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* /tlMain */}

        {/* Right sidebar */}
        <div className={styles.tlSidebar}>
          {/* Legend */}
          <div className={styles.timelineLegend}>
            {(['VACATION', 'SICK', 'UNPAID', 'OTHER'] as const).map((type) => (
              <div key={type} className={styles.tlLegendItem}>
                <div
                  className={styles.tlLegendDot}
                  style={{ background: LEAVE_TYPE_COLORS[type] }}
                />
                <Text variant="nano" mono color="muted" as="span">
                  {LEAVE_TYPE_LABELS[type]}
                </Text>
              </div>
            ))}
            <div className={styles.tlLegendItem}>
              <div
                className={styles.tlLegendDot}
                style={{ background: 'var(--warning)', opacity: 0.4 }}
              />
              <Text variant="nano" mono color="muted" as="span">
                Święto
              </Text>
            </div>
          </div>

          <div className={styles.infoNote}>
            <IconInfo width="12" height="12" className={styles.infoNoteIcon} />
            <Text variant="nano" as="span" color="muted">
              W oknie nieobecności slot engine nie przydziela pracownika. Brak zastępstwa =
              zablokowane sloty.
            </Text>
          </div>
        </div>
      </div>
      {/* /tlBody */}

      <UpcomingWidget workers={workers} />

      {leavesPanel}
      {editPanel}
    </div>
  );
}
