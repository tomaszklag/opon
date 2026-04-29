import { Heading, Text } from '@opony/design-system-web';
import {
  type Station,
  type ServiceType,
  SERVICE_LABELS,
} from '../../../../api-data-access/stations';
import styles from '../stations.module.css';

import type { DaySchedule } from '../../../../api-data-access/stations';

const WEEK_LABELS = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'ND'];
const WEEK_DOWS: DaySchedule['dayOfWeek'][] = [1, 2, 3, 4, 5, 6, 0];

const ALL_SERVICES: ServiceType[] = ['SEASONAL_SWAP', 'WHEEL_SWAP', 'BALANCING', 'PUNCTURE_REPAIR'];

interface Props {
  stations: Station[];
}

export function StationsPreview({ stations }: Props) {
  const todayDow = new Date().getDay();

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

          {/* One row per station (or per worker per station) */}
          {stations.map((station) => {
            const schedMap = new Map(station.schedule.map((d) => [d.dayOfWeek, d]));

            if (station.workers.length === 0) {
              return (
                <div key={station.id} className={styles.weekGridRow} style={{ opacity: 0.3 }}>
                  <Text
                    variant="nano"
                    as="span"
                    color="muted"
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
                  {WEEK_DOWS.map((dow) => (
                    <div key={dow} className={styles.wgCell} />
                  ))}
                </div>
              );
            }

            return station.workers.map((worker, wi) => {
              return (
                <div key={`${station.id}-${worker.workerId}`} className={styles.weekGridRow}>
                  <Text
                    variant="nano"
                    as="span"
                    color={wi === 0 ? 'secondary' : 'muted'}
                    mono
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingRight: 4,
                      fontSize: wi > 0 ? 9 : undefined,
                    }}
                  >
                    {station.name.slice(0, 5)} · {worker.workerName.split(' ')[0]}
                  </Text>
                  {WEEK_DOWS.map((dow) => {
                    const day = schedMap.get(dow);
                    if (!day?.open) {
                      return <div key={dow} className={styles.wgCell} />;
                    }

                    // Calculate bar position based on shift or day hours (08:00–18:00 window)
                    const dayStart = 8 * 60;
                    const dayEnd = 18 * 60;
                    const dayRange = dayEnd - dayStart;

                    let barLeft = 0;
                    let barWidth = 100;

                    if (worker.shiftStart && worker.shiftEnd) {
                      const [sh = '0', sm = '0'] = worker.shiftStart.split(':');
                      const [eh = '0', em = '0'] = worker.shiftEnd.split(':');
                      const shiftStart = parseInt(sh, 10) * 60 + parseInt(sm, 10);
                      const shiftEnd = parseInt(eh, 10) * 60 + parseInt(em, 10);
                      barLeft = Math.max(0, ((shiftStart - dayStart) / dayRange) * 100);
                      barWidth = Math.min(
                        100 - barLeft,
                        ((shiftEnd - shiftStart) / dayRange) * 100,
                      );
                    }

                    return (
                      <div key={dow} className={styles.wgCell}>
                        <div
                          className={styles.wgBar}
                          style={{
                            left: `${barLeft}%`,
                            width: `${barWidth}%`,
                            opacity: wi === 0 ? 0.75 : 0.45,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            });
          })}
        </div>

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
            Słupki ograniczone godzinami otwarcia warsztatu z <strong>Godziny pracy</strong>.
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
          {ALL_SERVICES.map((svc) => {
            const count = stations.filter((s) => s.services.includes(svc)).length;
            return (
              <div key={svc} className={styles.coverageItem}>
                <Text variant="body-sm" as="span" style={{ flex: 1 }}>
                  {SERVICE_LABELS[svc]}
                </Text>
                <div className={styles.coverageDots}>
                  {stations.map((s) => (
                    <span
                      key={s.id}
                      className={[styles.cdot, s.services.includes(svc) ? '' : styles.cdotOff].join(
                        ' ',
                      )}
                      title={s.name}
                    />
                  ))}
                </div>
                <Text variant="nano" as="span" color="secondary" mono weight="bold">
                  {count} st.
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
