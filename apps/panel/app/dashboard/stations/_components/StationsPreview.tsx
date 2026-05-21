'use client';

import { Heading, Text } from '@opony/design-system-web';
import { type Station, type DaySchedule } from '../../../../api-data-access/stations';
import { type Worker } from '../../../../api-data-access/workers';
import { type ServiceOption } from './StationCard';
import { IconAlertCircle } from '../../../../components/icons';
import styles from '../stations.module.css';

const WEEK_LABELS = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'ND'];
const WEEK_DOWS: DaySchedule['dayOfWeek'][] = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  stations: Station[];
  availableServices: ServiceOption[];
  workers: Worker[];
}

type CoverageStatus = 'ok' | 'partial' | 'none' | 'closed';

function getMonday(): Date {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const dow = today.getDay();
  today.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return today;
}

function getCurrentWeekISOs(): string[] {
  const monday = getMonday();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function leaveISO(d: string | Date): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function isOnLeave(worker: Worker, dateISO: string): boolean {
  return worker.leaves.some((leave) => {
    const start = leaveISO(leave.startDate as unknown as string | Date);
    const end = leaveISO(leave.endDate as unknown as string | Date);
    return start <= dateISO && dateISO <= end;
  });
}

function toMins(hhmm: string): number {
  const [h = '8', m = '0'] = hhmm.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function hoursHeight(start: string, end: string): number {
  const dayRange = (18 - 8) * 60;
  const s = toMins(start);
  const e = toMins(end);
  return Math.min(100, Math.max(0, ((e - s) / dayRange) * 100));
}

export function StationsPreview({ stations, availableServices, workers }: Props) {
  const todayDow = new Date().getDay();
  const weekISOs = getCurrentWeekISOs();

  // Pre-compute coverage for all stations × days
  const workerById = new Map(workers.map((w) => [w.id, w]));

  const coverage = stations.map((station) => {
    const schedMap = new Map(station.schedule.map((d) => [d.dayOfWeek, d]));
    const assigned = station.workers
      .map((sw) => workerById.get(sw.workerId))
      .filter((w): w is Worker => Boolean(w));

    const days: CoverageStatus[] = WEEK_DOWS.map((dow, idx) => {
      const day = schedMap.get(dow);
      if (!day?.open) return 'closed';
      if (assigned.length === 0) return 'ok';
      const onLeave = assigned.filter((w) => isOnLeave(w, weekISOs[idx]!));
      if (onLeave.length === 0) return 'ok';
      if (onLeave.length === assigned.length) return 'none';
      return 'partial';
    });

    return { station, schedMap, days };
  });

  // Collect per-station warnings for the summary
  const warnings = coverage
    .map(({ station, days }) => {
      const noneDays = WEEK_LABELS.filter((_, i) => days[i] === 'none');
      const partialDays = WEEK_LABELS.filter((_, i) => days[i] === 'partial');
      return { name: station.name, noneDays, partialDays };
    })
    .filter(({ noneDays, partialDays }) => noneDays.length > 0 || partialDays.length > 0);

  return (
    <>
      {/* Weekly grid panel */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="subsection" as="h3">
            Tydzień pracy
          </Heading>
          <Text variant="nano" as="span" color="muted" mono>
            bieżący tydzień
          </Text>
        </div>

        <div className={styles.weekGrid}>
          {/* Header row */}
          <div className={styles.weekGridHead}>
            <div />
            {WEEK_LABELS.map((label, i) => (
              <Text
                key={label}
                variant="nano"
                as="span"
                color={WEEK_DOWS[i] === todayDow ? 'accent' : 'muted'}
                mono
                weight="bold"
                style={{ textAlign: 'center' }}
              >
                {label}
              </Text>
            ))}
          </div>

          {/* One row per station */}
          {coverage.map(({ station, schedMap, days }) => (
            <div key={station.id} className={styles.weekGridRow}>
              <Text
                variant="nano"
                as="span"
                color="secondary"
                mono
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: 4,
                }}
              >
                {station.name.slice(0, 8)}
              </Text>
              {WEEK_DOWS.map((dow, idx) => {
                const status = days[idx]!;
                const day = schedMap.get(dow);

                if (status === 'closed' || !day?.open) {
                  return <div key={dow} className={styles.wgCell} />;
                }

                const h = hoursHeight(day.startTime, day.endTime);
                const barCls =
                  status === 'none'
                    ? styles.wgBarLeave
                    : status === 'partial'
                      ? styles.wgBarPartial
                      : styles.wgBar;

                return (
                  <div
                    key={dow}
                    className={styles.wgCell}
                    title={
                      status === 'none'
                        ? 'Wszyscy pracownicy na urlopie'
                        : status === 'partial'
                          ? 'Część pracowników na urlopie'
                          : undefined
                    }
                  >
                    <div className={barCls} style={{ height: `${h}%` }} />
                    {status !== 'ok' && (
                      <span
                        className={[
                          styles.wgLeaveDot,
                          status === 'none' ? styles.wgLeaveDotFull : styles.wgLeaveDotPartial,
                        ].join(' ')}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leave warnings summary */}
        {warnings.length > 0 && (
          <div className={styles.wgLeaveWarnings}>
            {warnings.map(({ name, noneDays, partialDays }) => (
              <div key={name} className={styles.wgLeaveWarningRow}>
                <IconAlertCircle
                  width="11"
                  height="11"
                  className={
                    noneDays.length > 0 ? styles.wgWarnIconDanger : styles.wgWarnIconWarning
                  }
                />
                <Text variant="nano" as="span" color="secondary">
                  <strong>{name.slice(0, 14)}</strong>
                  {noneDays.length > 0 && (
                    <>
                      {' '}
                      —{' '}
                      <span className={styles.wgWarnDanger}>
                        {noneDays.join(', ')}: brak obsady
                      </span>
                    </>
                  )}
                  {partialDays.length > 0 && (
                    <>
                      {' '}
                      —{' '}
                      <span className={styles.wgWarnWarning}>
                        {partialDays.join(', ')}: niepełna obsada
                      </span>
                    </>
                  )}
                </Text>
              </div>
            ))}
          </div>
        )}

        <div className={styles.infoNote}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <Text variant="nano" as="span" color="muted">
            Słupki ograniczone godzinami otwarcia. Kolory:{' '}
            <span className={styles.infoLeafDanger}>■</span> brak obsady,{' '}
            <span className={styles.infoLeafWarning}>■</span> niepełna obsada.
          </Text>
        </div>
      </div>

      {/* Coverage panel */}
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <Heading variant="subsection" as="h3">
            Pokrycie usług
          </Heading>
          <Text variant="nano" as="span" color="muted" mono>
            kto co może wykonać
          </Text>
        </div>

        <div className={styles.coverageList}>
          {availableServices.length === 0 ? (
            <Text variant="nano" as="span" color="muted">
              Brak zdefiniowanych usług.
            </Text>
          ) : (
            availableServices.map((svc) => {
              const count = stations.filter((s) => s.serviceIds.includes(svc.id)).length;
              return (
                <div key={svc.id} className={styles.coverageItem}>
                  <Text
                    variant="body-sm"
                    as="span"
                    color={svc.enabled ? undefined : 'muted'}
                    style={{ flex: 1, textDecoration: svc.enabled ? undefined : 'line-through' }}
                  >
                    {svc.name}
                  </Text>
                  <div className={styles.coverageDots}>
                    {stations.map((s) => (
                      <span
                        key={s.id}
                        className={[
                          styles.cdot,
                          s.serviceIds.includes(svc.id) ? '' : styles.cdotOff,
                        ].join(' ')}
                        style={svc.enabled ? undefined : { opacity: 0.35 }}
                        title={s.name}
                      />
                    ))}
                  </div>
                  <Text variant="nano" as="span" color="secondary" mono weight="bold">
                    {count} st.
                  </Text>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
