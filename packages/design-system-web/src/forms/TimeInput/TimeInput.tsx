'use client';

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './TimeInput.module.css';

export interface TimeInputProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  /** When set, clicking opens a two-column hour/minute picker */
  dropdownStep?: number;
  /** Earliest hour in picker, default "06:00" */
  dropdownMin?: string;
  /** Latest hour in picker, default "22:00" */
  dropdownMax?: string;
}

export function TimeInput({
  value,
  onChange,
  label,
  error,
  disabled,
  'aria-label': ariaLabel,
  dropdownStep,
  dropdownMin = '06:00',
  dropdownMax = '22:00',
}: TimeInputProps) {
  const parts = (value || '00:00').split(':');
  const hhVal = (parts[0] ?? '00').padStart(2, '0');
  const mmVal = (parts[1] ?? '00').padStart(2, '0');
  const curH = parseInt(hhVal, 10);
  const curM = parseInt(mmVal, 10);

  const [focused, setFocused] = useState<'hh' | 'mm' | null>(null);
  const [pending, setPending] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top?: number; bottom?: number; left: number }>({
    left: 0,
  });
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  const hhRef = useRef<HTMLSpanElement>(null);
  const mmRef = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeHourRef = useRef<HTMLButtonElement | null>(null);
  const activeMinRef = useRef<HTMLButtonElement | null>(null);

  const hasDropdown = dropdownStep !== undefined;
  const minHour = parseInt(dropdownMin.split(':')[0] ?? '6', 10);
  const maxHour = parseInt(dropdownMax.split(':')[0] ?? '22', 10);
  const hours = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const minuteStep = dropdownStep ?? 5;
  const minutes = Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep);

  // Scroll to active items when dropdown opens or value changes while open
  useEffect(() => {
    if (!dropdownOpen) return;
    // rAF so the portal has rendered
    const id = requestAnimationFrame(() => {
      activeHourRef.current?.scrollIntoView({ block: 'center' });
      activeMinRef.current?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(id);
  }, [dropdownOpen, value]);

  // Close on click outside (both root and portal dropdown)
  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e: MouseEvent) {
      const inRoot = rootRef.current?.contains(e.target as Node);
      const inDropdown = dropdownRef.current?.contains(e.target as Node);
      if (!inRoot && !inDropdown) setDropdownOpen(false);
    }
    function closeOnScrollResize() {
      setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', closeOnScrollResize);
    window.addEventListener('resize', closeOnScrollResize);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', closeOnScrollResize);
      window.removeEventListener('resize', closeOnScrollResize);
    };
  }, [dropdownOpen]);

  function openDropdown() {
    if (disabled || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const PICKER_MAX_H = 228; // max-height (220) + gap (4) + border slack (4)
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < PICKER_MAX_H && rect.top > PICKER_MAX_H;
    setDropdownPos(
      showAbove
        ? { bottom: window.innerHeight - rect.top + 4, left: rect.left }
        : { top: rect.bottom + 4, left: rect.left },
    );
    // Portal into the nearest <dialog> (top layer) so it renders above the modal;
    // fall back to document.body when used outside a dialog.
    const dialog = rootRef.current.closest('dialog');
    setPortalTarget(dialog ?? document.body);
    setDropdownOpen(true);
  }

  function emitHH(h: number) {
    onChange(`${String(Math.max(0, Math.min(23, h))).padStart(2, '0')}:${mmVal}`);
  }

  function emitMM(m: number) {
    onChange(`${hhVal}:${String(Math.max(0, Math.min(59, m))).padStart(2, '0')}`);
  }

  function focusMM() {
    setPending('');
    mmRef.current?.focus();
  }
  function focusHH() {
    setPending('');
    hhRef.current?.focus();
  }

  function handleDigit(d: number, seg: 'hh' | 'mm') {
    const max = seg === 'hh' ? 23 : 59;
    const emit = seg === 'hh' ? emitHH : emitMM;
    const earlyAdvance = seg === 'hh' ? d >= 3 : d >= 6;
    if (pending === '') {
      if (earlyAdvance) {
        emit(d);
        if (seg === 'hh') focusMM();
      } else {
        setPending(String(d));
        emit(d);
      }
    } else {
      const full = parseInt(pending + d, 10);
      setPending('');
      emit(full <= max ? full : d);
      if (seg === 'hh') focusMM();
    }
  }

  function handleHhKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      setPending('');
      return;
    }
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      emitHH((curH + 1) % 24);
      setPending('');
    } else if (e.key === 'ArrowDown') {
      emitHH((curH - 1 + 24) % 24);
      setPending('');
    } else if (e.key === 'ArrowRight') {
      focusMM();
    } else if (/^\d$/.test(e.key)) {
      handleDigit(parseInt(e.key, 10), 'hh');
    }
  }

  function handleMmKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === 'Escape') {
      setDropdownOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      setPending('');
      return;
    }
    e.preventDefault();
    if (e.key === 'ArrowUp') {
      emitMM((curM + 1) % 60);
      setPending('');
    } else if (e.key === 'ArrowDown') {
      emitMM((curM - 1 + 60) % 60);
      setPending('');
    } else if (e.key === 'ArrowLeft') {
      focusHH();
    } else if (/^\d$/.test(e.key)) {
      handleDigit(parseInt(e.key, 10), 'mm');
    }
  }

  const picker =
    hasDropdown && dropdownOpen && portalTarget
      ? createPortal(
          <div
            ref={dropdownRef}
            className={styles.picker}
            style={{ top: dropdownPos.top, bottom: dropdownPos.bottom, left: dropdownPos.left }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {/* Hours column */}
            <div className={styles.pickerCol}>
              {hours.map((h) => {
                const isActive = h === curH;
                return (
                  <button
                    key={h}
                    type="button"
                    ref={isActive ? activeHourRef : null}
                    className={[styles.pickerItem, isActive ? styles.pickerItemActive : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      emitHH(h);
                    }}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            {/* Minutes column */}
            <div className={[styles.pickerCol, styles.pickerColMin].filter(Boolean).join(' ')}>
              {minutes.map((m) => {
                const isActive = m === curM;
                return (
                  <button
                    key={m}
                    type="button"
                    ref={isActive ? activeMinRef : null}
                    className={[styles.pickerItem, isActive ? styles.pickerItemActive : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      emitMM(m);
                      setDropdownOpen(false);
                    }}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>,
          portalTarget,
        )
      : null;

  return (
    <div ref={rootRef} className={styles.root}>
      <div
        className={[
          styles.wrap,
          focused ? styles.wrapFocused : '',
          error ? styles.wrapError : '',
          disabled ? styles.wrapDisabled : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={ariaLabel}
        onClick={() => {
          if (hasDropdown) openDropdown();
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            if (!hasDropdown) hhRef.current?.focus();
          }
        }}
      >
        {label && <span className={styles.label}>{label}</span>}

        <span
          ref={hhRef}
          role="spinbutton"
          aria-label="Godziny"
          aria-valuenow={curH}
          aria-valuemin={0}
          aria-valuemax={23}
          tabIndex={disabled ? -1 : 0}
          className={[styles.seg, focused === 'hh' ? styles.segFocused : '']
            .filter(Boolean)
            .join(' ')}
          onFocus={() => {
            setFocused('hh');
            setPending('');
          }}
          onBlur={() => {
            setFocused(null);
            setPending('');
          }}
          onKeyDown={handleHhKey}
        >
          {hhVal}
        </span>

        <span className={styles.colon} aria-hidden="true">
          :
        </span>

        <span
          ref={mmRef}
          role="spinbutton"
          aria-label="Minuty"
          aria-valuenow={curM}
          aria-valuemin={0}
          aria-valuemax={59}
          tabIndex={disabled ? -1 : 0}
          className={[styles.seg, focused === 'mm' ? styles.segFocused : '']
            .filter(Boolean)
            .join(' ')}
          onFocus={() => {
            setFocused('mm');
            setPending('');
          }}
          onBlur={() => {
            setFocused(null);
            setPending('');
          }}
          onKeyDown={handleMmKey}
        >
          {mmVal}
        </span>
      </div>

      {picker}
    </div>
  );
}
