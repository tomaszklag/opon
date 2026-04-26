'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useWorkingHours, DISPLAY_ORDER } from '../../../lib/hooks/use-working-hours';
import { useAuth } from '../../../lib/auth';
import styles from './hours.module.css';

const DAY_META: Record<number, { abbr: string; full: string }> = {
  0: { abbr: 'NDZ', full: 'Niedziela' },
  1: { abbr: 'PON', full: 'Poniedziałek' },
  2: { abbr: 'WT', full: 'Wtorek' },
  3: { abbr: 'ŚR', full: 'Środa' },
  4: { abbr: 'CZW', full: 'Czwartek' },
  5: { abbr: 'PT', full: 'Piątek' },
  6: { abbr: 'SOB', full: 'Sobota' },
};

const SLOT_OPTIONS = [15, 30, 45, 60, 90];

function parseTime(time: string): [number, number] {
  const parts = time.split(':');
  return [parseInt(parts[0] ?? '0', 10), parseInt(parts[1] ?? '0', 10)];
}

function computeSlots(openTime: string, closeTime: string, slotMinutes: number): number {
  const [oh, om] = parseTime(openTime);
  const [ch, cm] = parseTime(closeTime);
  const totalMins = ch * 60 + cm - (oh * 60 + om);
  if (totalMins <= 0) return 0;
  return Math.floor(totalMins / slotMinutes);
}

function formatDuration(openTime: string, closeTime: string): string {
  const [oh, om] = parseTime(openTime);
  const [ch, cm] = parseTime(closeTime);
  const mins = ch * 60 + cm - (oh * 60 + om);
  if (mins <= 0) return '0 h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export default function HoursPage() {
  const router = useRouter();
  const { status } = useAuth();
  const { days, loading, saving, saved, errors, updateDay, save } = useWorkingHours();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const todayDow = new Date().getDay();

  return (
    <div className={styles.page}>
      <div className={styles.actionBar}>
        {saved && <span className={styles.savedChip}>Zapisano</span>}
        <button className={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>Godziny pracy</h1>
            <p className={styles.pageSub}>
              Ustaw dni i godziny przyjęć klientów. Slot to czas jednej rezerwowanej wizyty.
            </p>
          </header>

          <section className={styles.secCard}>
            <div className={styles.secHead}>
              <h2 className={styles.secTitle}>Tydzień</h2>
              <span className={styles.secSub}>Toggle — włącz lub wyłącz dzień</span>
            </div>

            {days.map((day) => {
              const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
              const isToday = day.dayOfWeek === todayDow;
              const err = errors[day.dayOfWeek];
              const slots = day.isClosed
                ? 0
                : computeSlots(day.openTime, day.closeTime, day.slotMinutes);

              return (
                <div
                  key={day.dayOfWeek}
                  className={[
                    styles.dayRow,
                    day.isClosed ? styles.dayRowClosed : '',
                    isToday ? styles.dayRowToday : '',
                  ].join(' ')}
                >
                  <div className={styles.dayName}>
                    <span className={styles.dayAbbr}>{meta.abbr}</span>
                    <span className={styles.dayFull}>{meta.full}</span>
                    {isToday && <span className={styles.todayTag}>Dziś</span>}
                  </div>

                  <button
                    className={[styles.toggle, !day.isClosed ? styles.toggleOn : ''].join(' ')}
                    role="switch"
                    aria-checked={!day.isClosed}
                    aria-label={`${meta.full} — ${day.isClosed ? 'nieczynne' : 'otwarte'}`}
                    onClick={() => updateDay(day.dayOfWeek, { isClosed: !day.isClosed })}
                  />

                  {day.isClosed ? (
                    <span className={styles.closedLabel}>Nieczynne</span>
                  ) : (
                    <>
                      <label
                        className={[styles.timeInput, err ? styles.timeInputError : ''].join(' ')}
                      >
                        <span className={styles.timeLabel}>Od</span>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                        />
                      </label>
                      <label
                        className={[styles.timeInput, err ? styles.timeInputError : ''].join(' ')}
                      >
                        <span className={styles.timeLabel}>Do</span>
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                        />
                      </label>
                      <select
                        className={styles.slotSelect}
                        value={day.slotMinutes}
                        onChange={(e) =>
                          updateDay(day.dayOfWeek, { slotMinutes: Number(e.target.value) })
                        }
                        aria-label="Długość slotu"
                      >
                        {SLOT_OPTIONS.map((m) => (
                          <option key={m} value={m}>
                            {m} min
                          </option>
                        ))}
                      </select>
                      <div className={styles.slotInfo}>
                        <span
                          className={[styles.slotCount, isToday ? styles.slotCountAccent : ''].join(
                            ' ',
                          )}
                        >
                          {slots} slotów
                        </span>
                        <span className={styles.slotHint}>
                          {formatDuration(day.openTime, day.closeTime)}
                        </span>
                      </div>
                    </>
                  )}

                  {err && <span className={styles.dayError}>{err}</span>}
                </div>
              );
            })}
          </section>
        </div>

        <aside className={styles.previewCol}>
          <div className={styles.previewPanel}>
            <div className={styles.previewHead}>
              <span className={styles.previewTitle}>Podgląd tygodnia</span>
              <span className={styles.previewSub}>wg bieżących ustawień</span>
            </div>
            <div className={styles.timeline}>
              {days.map((day) => {
                const meta = DAY_META[day.dayOfWeek] ?? { abbr: '?', full: '?' };
                const isToday = day.dayOfWeek === todayDow;

                const openPct = day.isClosed
                  ? 0
                  : (() => {
                      const [h, m] = parseTime(day.openTime);
                      return ((h * 60 + m) / (24 * 60)) * 100;
                    })();

                const widthPct = day.isClosed
                  ? 0
                  : (() => {
                      const [oh, om] = parseTime(day.openTime);
                      const [ch, cm] = parseTime(day.closeTime);
                      const mins = ch * 60 + cm - (oh * 60 + om);
                      return Math.max(0, (mins / (24 * 60)) * 100);
                    })();

                return (
                  <div
                    key={day.dayOfWeek}
                    className={[
                      styles.tlDay,
                      isToday ? styles.tlDayToday : '',
                      day.isClosed ? styles.tlDayClosed : '',
                    ].join(' ')}
                  >
                    <span className={styles.tlDayLabel}>{meta.abbr}</span>
                    <div
                      className={[styles.tlBarWrap, day.isClosed ? styles.tlBarClosed : ''].join(
                        ' ',
                      )}
                    >
                      <div
                        className={styles.tlBarFill}
                        style={{ left: `${openPct}%`, width: `${widthPct}%` }}
                      />
                    </div>
                    <span className={styles.tlDayHours}>
                      {day.isClosed ? '—' : `${day.openTime}–${day.closeTime}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
