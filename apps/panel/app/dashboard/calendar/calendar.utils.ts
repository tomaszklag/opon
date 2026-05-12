import type { Booking, BookingStatus } from '../../../api-data-access/bookings';

// ── Grid constants ────────────────────────────────────────────────────────────
export const HOUR_START = 8;
export const HOUR_END = 18;
export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
export const PX_PER_HOUR = 60;
export const GRID_HEIGHT = (HOUR_END - HOUR_START + 1) * PX_PER_HOUR;

// ── Labels ────────────────────────────────────────────────────────────────────
export const DAY_ABBR = ['ND', 'PON', 'WT', 'ŚR', 'CZ', 'PT', 'SB'];
export const DAY_NAMES_FULL = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
];
export const MONTH_NAMES_GEN = [
  'Stycznia',
  'Lutego',
  'Marca',
  'Kwietnia',
  'Maja',
  'Czerwca',
  'Lipca',
  'Sierpnia',
  'Września',
  'Października',
  'Listopada',
  'Grudnia',
];
export const MONTH_NAMES = [
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

// ── Types ─────────────────────────────────────────────────────────────────────
export type CalendarView = 'day' | 'week' | 'month';

export type FilterType = 'all' | 'confirmed' | 'pending' | 'completed';
export const FILTER_LABELS: Record<FilterType, string> = {
  all: 'Wszystkie',
  confirmed: 'Potwierdzone',
  pending: 'Oczekujące',
  completed: 'Zakończone',
};

// ── Date helpers ──────────────────────────────────────────────────────────────
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekStart(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function buildWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function buildMonthGrid(date: Date): Date[][] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const gridStart = getWeekStart(firstDay);
  const lastWeekStart = getWeekStart(lastDay);
  const weekCount =
    Math.round((lastWeekStart.getTime() - gridStart.getTime()) / (7 * 86400000)) + 1;
  return Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d)),
  );
}

// ── Formatting ────────────────────────────────────────────────────────────────
export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function formatDayDate(date: Date): string {
  const monthName = MONTH_NAMES_GEN[date.getMonth()] ?? 'sty';
  return `${date.getDate()} ${monthName.slice(0, 3).toLowerCase()}`;
}

export function timeAgo(isoString: string): string {
  const created = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m} min` : `${h}h`;
}

// ── Grid helpers ──────────────────────────────────────────────────────────────
export function getBookingStyle(startAt: string, endAt: string): { top: string; height: string } {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const topPx = startMinutes - HOUR_START * 60;
  const heightPx = endMinutes - startMinutes;
  return { top: `${topPx}px`, height: `${Math.max(heightPx, 20)}px` };
}

export function getNowLineTop(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() - HOUR_START * 60;
}

// ── Booking helpers ───────────────────────────────────────────────────────────
export function isCancelledOrDone(status: BookingStatus): boolean {
  return [
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_PROVIDER',
    'CANCELLED_BY_SYSTEM',
    'NO_SHOW',
    'REJECTED',
  ].includes(status);
}

export function matchesFilter(booking: Booking, filter: FilterType): boolean {
  if (filter === 'all') return true;
  if (filter === 'confirmed')
    return booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS';
  if (filter === 'pending') return booking.status === 'PENDING';
  if (filter === 'completed')
    return booking.status === 'COMPLETED' || isCancelledOrDone(booking.status);
  return true;
}

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function visitCountLabel(n: number): string {
  if (n === 1) return '1 wizyta';
  if (n < 5) return `${n} wizyty`;
  return `${n} wizyt`;
}

export function snapTimeFromOffset(offsetY: number): string {
  const startMins = (HOURS[0] ?? 8) * 60;
  const rawMins = startMins + (offsetY / PX_PER_HOUR) * 60;
  const snapped = Math.round(rawMins / 15) * 15;
  const clamped = Math.min(Math.max(snapped, startMins), 21 * 60 + 45);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
