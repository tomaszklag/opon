'use client';
import React, { useRef, useMemo, useEffect, useState } from 'react';
import styles from './DayTimeline.module.css';

const PX_PER_MIN = 2;
const TL_START_H = 7;
const TL_END_H = 20;

export type TlSlot = {
  startAt: string;
  endAt: string;
  isAvailable: boolean;
  conflictCount: number;
};

export type BookingBlock = {
  startAt: string;
  endAt: string;
  clientName: string;
  status: string;
};

export interface DayTimelineProps {
  slots: TlSlot[];
  bookings?: BookingBlock[];
  durationMinutes: number | null;
  selectedTime: string;
  date: string;
  onSelect: (time: string) => void;
}

function isoToLocalMin(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function fmtMin(min: number): string {
  return `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

function bookingStatusClass(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return styles.timelineBookingConfirmed ?? '';
    case 'PENDING':
      return styles.timelineBookingPending ?? '';
    case 'IN_PROGRESS':
      return styles.timelineBookingProgress ?? '';
    default:
      return styles.timelineBookingCompleted ?? '';
  }
}

export function DayTimeline({
  slots,
  bookings,
  durationMinutes,
  selectedTime,
  date,
  onSelect,
}: DayTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rangeStartMin = TL_START_H * 60;
  const rangeEndMin = TL_END_H * 60;
  const trackHeight = (rangeEndMin - rangeStartMin) * PX_PER_MIN;
  const [hoverMin, setHoverMin] = useState<number | null>(null);

  function minToTop(min: number): number {
    return (min - rangeStartMin) * PX_PER_MIN;
  }

  const busyBlocks = useMemo(() => {
    const busy = slots.filter((s) => !s.isAvailable || s.conflictCount > 0);
    if (!busy.length) return [];
    const blocks: { startMin: number; endMin: number }[] = [];
    let cur = { startMin: isoToLocalMin(busy[0]!.startAt), endMin: isoToLocalMin(busy[0]!.endAt) };
    for (let i = 1; i < busy.length; i++) {
      const s = isoToLocalMin(busy[i]!.startAt);
      const e = isoToLocalMin(busy[i]!.endAt);
      if (s <= cur.endMin) {
        cur.endMin = Math.max(cur.endMin, e);
      } else {
        blocks.push(cur);
        cur = { startMin: s, endMin: e };
      }
    }
    blocks.push(cur);
    return blocks;
  }, [slots]);

  const selectedStartMin = useMemo(() => {
    if (!selectedTime) return null;
    const [h, m] = selectedTime.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  }, [selectedTime]);

  const selectedEndMin =
    selectedStartMin !== null && durationMinutes !== null
      ? selectedStartMin + durationMinutes
      : null;

  function overlapsBookings(startMin: number, endMin: number): boolean {
    if (bookings?.length) {
      return bookings.some(
        (b) => isoToLocalMin(b.startAt) < endMin && isoToLocalMin(b.endAt) > startMin,
      );
    }
    return busyBlocks.some((b) => b.startMin < endMin && b.endMin > startMin);
  }

  const hasConflict = useMemo(() => {
    if (selectedStartMin === null || selectedEndMin === null) return false;
    return overlapsBookings(selectedStartMin, selectedEndMin);
  }, [selectedStartMin, selectedEndMin, busyBlocks, bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  const hoverHasConflict = useMemo(() => {
    if (hoverMin === null) return false;
    return overlapsBookings(hoverMin, hoverMin + (durationMinutes ?? 30));
  }, [hoverMin, durationMinutes, busyBlocks, bookings]); // eslint-disable-line react-hooks/exhaustive-deps

  const nowMin = useMemo(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }, []);

  const isToday = useMemo(() => {
    const n = new Date();
    const local = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    return date === local;
  }, [date]);

  function yToSnappedMin(clientY: number): number {
    const el = containerRef.current!;
    const rawY = clientY - el.getBoundingClientRect().top + el.scrollTop;
    const rawMin = Math.round(rawY / PX_PER_MIN / 5) * 5 + rangeStartMin;
    const dur = durationMinutes ?? 30;
    return Math.max(rangeStartMin, Math.min(rangeEndMin - dur, rawMin));
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    onSelect(fmtMin(yToSnappedMin(e.clientY)));
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    setHoverMin(yToSnappedMin(e.clientY));
  }

  function handleMouseLeave() {
    setHoverMin(null);
  }

  // Auto-scroll to selected time
  useEffect(() => {
    if (!containerRef.current || selectedStartMin === null) return;
    containerRef.current.scrollTo({
      top: Math.max(0, minToTop(selectedStartMin) - 80),
      behavior: 'smooth',
    });
  }, [selectedStartMin]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial scroll: to "now" on today, to 08:00 otherwise
  useEffect(() => {
    if (!containerRef.current) return;
    const target = isToday ? nowMin : rangeStartMin + 60;
    containerRef.current.scrollTo({
      top: Math.max(0, minToTop(Math.max(rangeStartMin, target)) - 60),
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hours = Array.from({ length: TL_END_H - TL_START_H + 1 }, (_, i) => TL_START_H + i);

  return (
    <div
      ref={containerRef}
      className={styles.timeline}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.timelineTrack} style={{ height: trackHeight }}>
        {hours.map((h) => (
          <div key={h} className={styles.timelineHour} style={{ top: minToTop(h * 60) }}>
            <span className={styles.timelineHourLabel}>{String(h).padStart(2, '0')}:00</span>
            <div className={styles.timelineHourRule} />
          </div>
        ))}
        {hours.slice(0, -1).map((h) => (
          <div
            key={`${h}h`}
            className={styles.timelineHalfRule}
            style={{ top: minToTop(h * 60 + 30) }}
          />
        ))}
        {isToday && nowMin >= rangeStartMin && nowMin <= rangeEndMin && (
          <div className={styles.timelineNow} style={{ top: minToTop(nowMin) }} />
        )}

        {/* Busy blocks — only when no booking data */}
        {!bookings?.length &&
          busyBlocks.map((b, i) => (
            <div
              key={i}
              className={styles.timelineBusy}
              style={{
                top: minToTop(b.startMin),
                height: Math.max((b.endMin - b.startMin) * PX_PER_MIN, 3),
              }}
            />
          ))}

        {/* Existing booking blocks */}
        {bookings?.map((b, i) => {
          const startMin = isoToLocalMin(b.startAt);
          const endMin = isoToLocalMin(b.endAt);
          const h = Math.max((endMin - startMin) * PX_PER_MIN, 8);
          return (
            <div
              key={i}
              className={`${styles.timelineBooking} ${bookingStatusClass(b.status)}`}
              style={{ top: minToTop(startMin), height: h }}
            >
              {h >= 16 && (
                <span className={styles.timelineBookingTime}>
                  {fmtMin(startMin)}–{fmtMin(endMin)}
                </span>
              )}
              {h >= 24 && <span className={styles.timelineBookingName}>{b.clientName}</span>}
            </div>
          );
        })}

        {/* Hover ghost — shows where the next click would land */}
        {hoverMin !== null && (
          <div
            className={`${styles.timelineHoverGhost} ${hoverHasConflict ? styles.timelineHoverGhostConflict : ''}`}
            style={{
              top: minToTop(hoverMin),
              height: Math.max((durationMinutes ?? 30) * PX_PER_MIN, 10),
            }}
          >
            <span className={styles.timelineHoverGhostLabel}>{fmtMin(hoverMin)}</span>
          </div>
        )}

        {/* Selected new booking block */}
        {selectedStartMin !== null && (
          <div
            className={`${styles.timelineNew} ${hasConflict ? styles.timelineNewConflict : ''}`}
            style={{
              top: minToTop(selectedStartMin),
              height: Math.max((durationMinutes ?? 30) * PX_PER_MIN, 10),
            }}
          >
            <span className={styles.timelineNewLabel}>
              {fmtMin(selectedStartMin)}
              {selectedEndMin !== null && ` → ${fmtMin(selectedEndMin)}`}
              {durationMinutes !== null && ` (${durationMinutes} min)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
