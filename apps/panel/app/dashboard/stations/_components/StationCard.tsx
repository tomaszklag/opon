import { useState } from 'react';
import { Button, Text, Toggle } from '@opony/design-system-web';
import {
  IconChevronRight,
  IconXClose,
  IconPlus,
  IconCheck,
  IconUserAdd,
  IconAlertCircle,
} from '../../../../components/icons';
import {
  type Station,
  type ServiceType,
  type DaySchedule,
  SERVICE_LABELS,
} from '../../../../api-data-access/stations';
import styles from '../stations.module.css';

// Day display config
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

const MINI_DAY_LABELS: Record<number, string> = {
  1: 'P',
  2: 'W',
  3: 'Ś',
  4: 'C',
  5: 'P',
  6: 'S',
  0: 'N',
};

// Avatar colors — cycled by worker index
const AVATAR_COLORS = [
  styles.avatarOrange,
  styles.avatarBlue,
  styles.avatarGreen,
  styles.avatarPurple,
];

function getAvatarClass(index: number): string {
  const cls = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return cls ?? styles.avatarOrange ?? '';
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
        return {
          hasOverlap: true,
          overlapStr: `${fmt(overlapStart)}–${fmt(overlapEnd)}`,
        };
      }
    }
  }
  return { hasOverlap: false, overlapStr: '' };
}

interface Props {
  station: Station;
  availableServices: ServiceType[]; // services active in pricing
  onUpdateName: (name: string) => void;
  onToggleService: (service: ServiceType) => void;
  onUpdateSchedule: (schedule: DaySchedule[]) => void;
  onRemoveWorker: (workerId: string) => void;
  onDelete: () => void;
}

export function StationCard({
  station,
  availableServices,
  onUpdateName,
  onToggleService,
  onUpdateSchedule,
  onRemoveWorker,
  onDelete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [nameVal, setNameVal] = useState(station.name);

  const hasWorkers = station.workers.length > 0;
  const isActive = hasWorkers && station.services.length > 0;

  const { hasOverlap, overlapStr } = detectOverlap(station);

  // Build schedule map for easy access
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
    const updated = station.schedule.map((d) =>
      d.dayOfWeek === dow ? { ...d, open: !d.open } : d,
    );
    // If not in schedule yet, add it
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
        updated.map((d) => (d.dayOfWeek === dow ? { ...d, open: !current.open } : d)),
      );
    }
  }

  function handleTimeChange(dow: number, field: 'startTime' | 'endTime', value: string) {
    const updated = station.schedule.map((d) =>
      d.dayOfWeek === dow ? { ...d, [field]: value } : d,
    );
    onUpdateSchedule(updated);
  }

  function handleNameBlur() {
    if (nameVal.trim() !== station.name) {
      onUpdateName(nameVal.trim() || station.name);
    }
  }

  return (
    <div
      className={[
        styles.stationCard,
        expanded ? styles.stationCardExpanded : '',
        !isActive ? styles.stationCardInactive : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* ── Header ── */}
      <div
        className={styles.cardHeader}
        onClick={() => setExpanded((e) => !e)}
        role="button"
        aria-expanded={expanded}
      >
        {/* Avatar stack */}
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

        {/* Info */}
        <div className={styles.headerInfo}>
          <Text variant="kicker" as="span" weight="bold">
            {station.name}
          </Text>
          {hasWorkers ? (
            <Text variant="nano" as="span" color="secondary">
              {station.workers.map((w) => w.workerName).join(', ')}
            </Text>
          ) : (
            <Text variant="nano" as="span" color="muted">
              Brak pracownika — kliknij aby przypisać
            </Text>
          )}
        </div>

        {/* Service pills */}
        <div className={styles.svcPills}>
          {station.services.length > 0 ? (
            station.services.map((svc) => (
              <Text
                key={svc}
                variant="nano"
                as="span"
                className={[styles.svcPill, styles.svcPillActive].join(' ')}
              >
                {SERVICE_LABELS[svc]}
              </Text>
            ))
          ) : (
            <Text
              variant="nano"
              as="span"
              className={[styles.svcPill, styles.svcPillEmpty].join(' ')}
              color="muted"
            >
              brak usług
            </Text>
          )}
        </div>

        {/* Mini schedule (collapsed) */}
        {!expanded && (
          <div className={styles.miniSched}>
            {DISPLAY_ORDER.map((dow) => {
              const day = getDay(dow);
              return (
                <div key={dow} className={styles.miniDay}>
                  <Text variant="nano" as="span" color="muted" mono>
                    {MINI_DAY_LABELS[dow]}
                  </Text>
                  <div
                    className={[
                      styles.miniDayBar,
                      day.open ? styles.miniDayBarOn : styles.miniDayBarOff,
                    ].join(' ')}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Status */}
        <div className={styles.statusIndicator}>
          <span
            className={[
              styles.statusDot,
              isActive ? styles.statusDotActive : styles.statusDotInactive,
            ].join(' ')}
          />
          <Text
            variant="nano"
            as="span"
            color="muted"
            mono
            className={isActive ? styles.statusActive : undefined}
          >
            {isActive ? 'aktywne' : 'nieaktywne'}
          </Text>
        </div>

        {/* Chevron */}
        <IconChevronRight
          width="16"
          height="16"
          className={[styles.chevron, expanded ? styles.chevronOpen : ''].join(' ')}
        />
      </div>

      {/* ── Expanded body ── */}
      {expanded && (
        <div className={styles.cardBody}>
          {/* Name field */}
          <div className={styles.fieldRow}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              className={styles.fieldLabel}
              color="muted"
            >
              Nazwa
            </Text>
            <input
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleNameBlur}
              className={styles.nameInput}
              aria-label="Nazwa stanowiska"
            />
          </div>

          {/* Workers */}
          <div className={styles.fieldRow}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              className={styles.fieldLabel}
              color="muted"
            >
              Pracownicy
            </Text>
            <div className={styles.workersList}>
              {station.workers.map((w, i) => (
                <div key={w.workerId} className={styles.workerTag}>
                  <div
                    className={[
                      styles.workerAvatar,
                      styles.workerTagAvatar,
                      getAvatarClass(i),
                    ].join(' ')}
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
              <button className={styles.addWorkerBtn} disabled>
                <IconPlus width="12" height="12" />
                Przypisz pracownika
              </button>
            </div>
          </div>

          {/* Overlap warning */}
          {hasOverlap && (
            <div className={styles.overlapNote}>
              {/* DS nie ma AlertCircle w zestawie — używamy ikony z icons.tsx */}
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
            <Text
              variant="nano"
              as="span"
              weight="bold"
              className={styles.fieldLabel}
              color="muted"
            >
              Usługi
            </Text>
            <div className={styles.svcCheckList}>
              {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((svc) => {
                const isChecked = station.services.includes(svc);
                const isDisabled = !availableServices.includes(svc);

                return (
                  <div
                    key={svc}
                    className={[
                      styles.svcCheckItem,
                      isChecked && !isDisabled ? styles.svcCheckItemChecked : '',
                      isDisabled ? styles.svcCheckItemDisabled : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => !isDisabled && onToggleService(svc)}
                    role="checkbox"
                    aria-checked={isChecked && !isDisabled}
                    aria-disabled={isDisabled}
                    tabIndex={isDisabled ? -1 : 0}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                        e.preventDefault();
                        onToggleService(svc);
                      }
                    }}
                  >
                    <div
                      className={[
                        styles.checkbox,
                        isChecked && !isDisabled ? styles.checkboxChecked : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {isChecked && !isDisabled && (
                        <IconCheck width="10" height="10" stroke="white" strokeWidth={3} />
                      )}
                    </div>
                    <Text
                      variant="body-sm"
                      as="span"
                      weight="bold"
                      color={isDisabled ? 'muted' : 'primary'}
                    >
                      {SERVICE_LABELS[svc]}
                    </Text>
                    {isDisabled && (
                      <Text variant="nano" as="span" className={styles.offBadge} mono>
                        OFF w cenniku
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className={styles.fieldRow}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              className={styles.fieldLabel}
              color="muted"
            >
              Grafik
            </Text>
            <div className={styles.schedGrid}>
              {DISPLAY_ORDER.map((dow) => {
                const day = getDay(dow);
                return (
                  <div
                    key={dow}
                    className={[styles.schedRow, !day.open ? styles.schedRowClosed : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Text variant="nano" as="span" weight="bold" mono>
                      {DAY_LABELS[dow]}
                    </Text>
                    <Toggle
                      size="sm"
                      checked={day.open}
                      onChange={() => handleToggleDay(dow)}
                      aria-label={`${DAY_LABELS[dow]} aktywny`}
                    />
                    {day.open ? (
                      <>
                        <label className={styles.timeInput}>
                          <Text variant="nano" as="span" color="muted" mono>
                            Od
                          </Text>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleTimeChange(dow, 'startTime', e.target.value)}
                            className={styles.timeInputNative}
                            aria-label={`${DAY_LABELS[dow]} od`}
                          />
                        </label>
                        <label className={styles.timeInput}>
                          <Text variant="nano" as="span" color="muted" mono>
                            Do
                          </Text>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleTimeChange(dow, 'endTime', e.target.value)}
                            className={styles.timeInputNative}
                            aria-label={`${DAY_LABELS[dow]} do`}
                          />
                        </label>
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
                      >
                        — wolne —
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delete button */}
          <div className={styles.deleteRow}>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              Usuń stanowisko
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
