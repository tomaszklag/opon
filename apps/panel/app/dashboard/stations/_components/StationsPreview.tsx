import { Heading, Text } from '@opony/design-system-web';
import { type Station, type DaySchedule } from '../../../../api-data-access/stations';
import { type ServiceOption } from './StationCard';
import styles from '../stations.module.css';

const WEEK_LABELS = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'ND'];
const WEEK_DOWS: DaySchedule['dayOfWeek'][] = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  stations: Station[];
  availableServices: ServiceOption[];
}

export function StationsPreview({ stations, availableServices }: Props) {
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

          {/* One row per station — vertical bars = proportion of working hours */}
          {stations.map((station) => {
            const schedMap = new Map(station.schedule.map((d) => [d.dayOfWeek, d]));
            const dayRange = (18 - 8) * 60; // 8:00–18:00 window = 600 min

            function hoursHeight(start: string, end: string): number {
              const [sh = '8', sm = '0'] = start.split(':');
              const [eh = '18', em = '0'] = end.split(':');
              const s = parseInt(sh, 10) * 60 + parseInt(sm, 10);
              const e = parseInt(eh, 10) * 60 + parseInt(em, 10);
              return Math.min(100, Math.max(0, ((e - s) / dayRange) * 100));
            }

            return (
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
                {WEEK_DOWS.map((dow) => {
                  const day = schedMap.get(dow);
                  if (!day?.open) return <div key={dow} className={styles.wgCell} />;
                  const h = hoursHeight(day.startTime, day.endTime);
                  return (
                    <div key={dow} className={styles.wgCell}>
                      <div className={styles.wgBar} style={{ height: `${h}%` }} />
                    </div>
                  );
                })}
              </div>
            );
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
                    style={{
                      flex: 1,
                      textDecoration: svc.enabled ? undefined : 'line-through',
                    }}
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
