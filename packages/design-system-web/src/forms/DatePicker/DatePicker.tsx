'use client';
import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { FieldLabel } from '../FieldLabel/FieldLabel';
import styles from './DatePicker.module.css';

export interface DatePickerProps {
  label?: string;
  /** ISO date string: "YYYY-MM-DD" */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
}

const MONTHS_PL = [
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
const DAYS_PL = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function today(): string {
  return toISO(new Date());
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** "YYYY-MM-DD" → "DD.MM.YYYY" */
function toEditable(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** "D.M.YYYY" or "DD.MM.YYYY" → "YYYY-MM-DD", or null if invalid */
function parseEditable(text: string): string | null {
  const match = text.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1]!, 10);
  const month = parseInt(match[2]!, 10);
  const year = parseInt(match[3]!, 10);
  if (month < 1 || month > 12 || day < 1) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return toISO(d);
}

function firstWeekday(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0 … Sun=6
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'DD.MM.RRRR',
  required,
  error,
  hint,
  id,
  disabled,
}: DatePickerProps) {
  const uid = useId();
  const inputId = id ?? `datepicker-${uid}`;
  const popupId = `${inputId}-popup`;

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(() => (value ? toEditable(value) : ''));
  const [displayYear, setDisplayYear] = useState(() => new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(() => new Date().getMonth());

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const todayISO = today();
  const tomorrowISO = addDays(todayISO, 1);

  // Sync input text when value changes from outside (e.g. quick filter, parent reset)
  // but only when the input isn't focused
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputText(value ? toEditable(value) : '');
    }
  }, [value]);

  const openAtDate = useCallback(
    (iso: string) => {
      const d = new Date((iso || todayISO) + 'T12:00:00');
      setDisplayYear(d.getFullYear());
      setDisplayMonth(d.getMonth());
      setIsOpen(true);
    },
    [todayISO],
  );

  const close = useCallback(() => setIsOpen(false), []);

  function selectDate(iso: string) {
    setInputText(toEditable(iso));
    onChange(iso);
    close();
    inputRef.current?.blur();
  }

  function selectQuick(iso: string) {
    setInputText(toEditable(iso));
    onChange(iso);
    const d = new Date(iso + 'T12:00:00');
    setDisplayYear(d.getFullYear());
    setDisplayMonth(d.getMonth());
  }

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

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
        // Revert text to last valid value if what was typed is incomplete
        setInputText(value ? toEditable(value) : '');
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [isOpen, close, value]);

  function handleFocus() {
    openAtDate(value || todayISO);
  }

  function handleBlur() {
    // Revert to current value if the typed text isn't a fully valid date
    const parsed = parseEditable(inputText);
    if (!parsed) {
      setInputText(value ? toEditable(value) : '');
    }
    // Delay close so calendar clicks can fire first
    setTimeout(close, 120);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setInputText(text);

    const parsed = parseEditable(text);
    if (parsed) {
      onChange(parsed);
      // Navigate calendar to the newly typed date
      const d = new Date(parsed + 'T12:00:00');
      setDisplayYear(d.getFullYear());
      setDisplayMonth(d.getMonth());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      inputRef.current?.blur();
    }
  }

  // Calendar grid cells: null = leading empty, number = day-of-month
  const leading = firstWeekday(displayYear, displayMonth);
  const total = daysInMonth(displayYear, displayMonth);
  const cells: (number | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}

      <div className={styles.inputWrap}>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={popupId}
          aria-required={required}
          aria-invalid={error ? 'true' : undefined}
          disabled={disabled}
          placeholder={placeholder}
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={[styles.input, isOpen ? styles.inputOpen : '', error ? styles.inputError : '']
            .filter(Boolean)
            .join(' ')}
          autoComplete="off"
        />

        {isOpen && (
          <div id={popupId} role="dialog" aria-label="Wybierz datę" className={styles.popup}>
            {/* Quick filters */}
            <div className={styles.quickFilters}>
              <button
                type="button"
                className={`${styles.quickBtn} ${value === todayISO ? styles.quickBtnActive : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectQuick(todayISO);
                }}
              >
                Dzisiaj
              </button>
              <button
                type="button"
                className={`${styles.quickBtn} ${value === tomorrowISO ? styles.quickBtnActive : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectQuick(tomorrowISO);
                }}
              >
                Jutro
              </button>
            </div>

            <div className={styles.divider} />

            {/* Month navigation */}
            <div className={styles.calHeader}>
              <button
                type="button"
                className={styles.navBtn}
                onMouseDown={(e) => {
                  e.preventDefault();
                  prevMonth();
                }}
                aria-label="Poprzedni miesiąc"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 12L6 8l4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className={styles.monthLabel}>
                {MONTHS_PL[displayMonth]} {displayYear}
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onMouseDown={(e) => {
                  e.preventDefault();
                  nextMonth();
                }}
                aria-label="Następny miesiąc"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Day grid */}
            <div className={styles.calGrid}>
              {DAYS_PL.map((d) => (
                <span key={d} className={styles.dayHeader}>
                  {d}
                </span>
              ))}
              {cells.map((day, idx) => {
                if (day === null) return <span key={`e${idx}`} className={styles.dayEmpty} />;
                const cellISO = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = cellISO === value;
                const isToday = cellISO === todayISO;
                return (
                  <button
                    key={cellISO}
                    type="button"
                    aria-label={cellISO}
                    aria-pressed={isSelected}
                    className={[
                      styles.day,
                      isSelected ? styles.daySelected : '',
                      isToday && !isSelected ? styles.dayToday : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectDate(cellISO);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
