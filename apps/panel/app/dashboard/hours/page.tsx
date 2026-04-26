'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getWorkingHours, saveWorkingHours } from '../../../api-data-access/working-hours';
import { useAuth } from '../../../lib/auth';
import styles from './hours.module.css';

type DayEntry = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  slotMinutes: number;
};

function parseTime(time: string): [number, number] {
  const parts = time.split(':');
  return [parseInt(parts[0] ?? '0', 10), parseInt(parts[1] ?? '0', 10)];
}

const DAY_META: Record<number, { abbr: string; full: string }> = {
  0: { abbr: 'NDZ', full: 'Niedziela' },
  1: { abbr: 'PON', full: 'Poniedziałek' },
  2: { abbr: 'WT', full: 'Wtorek' },
  3: { abbr: 'ŚR', full: 'Środa' },
  4: { abbr: 'CZW', full: 'Czwartek' },
  5: { abbr: 'PT', full: 'Piątek' },
  6: { abbr: 'SOB', full: 'Sobota' },
};

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const SLOT_OPTIONS = [15, 30, 45, 60, 90];

function defaultDay(dayOfWeek: number): DayEntry {
  return {
    dayOfWeek,
    isClosed: dayOfWeek === 0,
    openTime: dayOfWeek === 6 ? '09:00' : '08:00',
    closeTime: dayOfWeek === 6 ? '14:00' : '18:00',
    slotMinutes: 45,
  };
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

  const [days, setDays] = useState<DayEntry[]>(() => DISPLAY_ORDER.map(defaultDay));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    getWorkingHours()
      .then((serverDays) => {
        setDays(
          DISPLAY_ORDER.map((dow) => {
            const found = serverDays.find((d) => d.dayOfWeek === dow);
            if (!found) return defaultDay(dow);
            return {
              dayOfWeek: found.dayOfWeek,
              isClosed: found.isClosed,
              openTime: found.openTime ?? (dow === 6 ? '09:00' : '08:00'),
              closeTime: found.closeTime ?? (dow === 6 ? '14:00' : '18:00'),
              slotMinutes: found.slotMinutes,
            };
          }),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  function updateDay(dayOfWeek: number, patch: Partial<DayEntry>) {
    setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[dayOfWeek];
      return next;
    });
  }

  function validate(): boolean {
    const errs: Record<number, string> = {};
    for (const day of days) {
      if (day.isClosed) continue;
      if (!day.openTime) {
        errs[day.dayOfWeek] = 'Podaj godzinę otwarcia';
        continue;
      }
      if (!day.closeTime) {
        errs[day.dayOfWeek] = 'Podaj godzinę zamknięcia';
        continue;
      }
      const [oh, om] = parseTime(day.openTime);
      const [ch, cm] = parseTime(day.closeTime);
      if (oh * 60 + om >= ch * 60 + cm) {
        errs[day.dayOfWeek] = 'Godzina otwarcia musi być przed godziną zamknięcia';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveWorkingHours({ days });
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
    } catch {
      // no-op
    } finally {
      setSaving(false);
    }
  }

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
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
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
