export const DAY_META: Record<number, { abbr: string; full: string }> = {
  0: { abbr: 'NDZ', full: 'Niedziela' },
  1: { abbr: 'PON', full: 'Poniedziałek' },
  2: { abbr: 'WT', full: 'Wtorek' },
  3: { abbr: 'ŚR', full: 'Środa' },
  4: { abbr: 'CZW', full: 'Czwartek' },
  5: { abbr: 'PT', full: 'Piątek' },
  6: { abbr: 'SOB', full: 'Sobota' },
};

export const SLOT_OPTIONS = [15, 30, 45, 60, 90];

export function parseTime(time: string): [number, number] {
  const parts = time.split(':');
  return [parseInt(parts[0] ?? '0', 10), parseInt(parts[1] ?? '0', 10)];
}

export function computeSlots(openTime: string, closeTime: string, slotMinutes: number): number {
  const [oh, om] = parseTime(openTime);
  const [ch, cm] = parseTime(closeTime);
  const totalMins = ch * 60 + cm - (oh * 60 + om);
  if (totalMins <= 0) return 0;
  return Math.floor(totalMins / slotMinutes);
}

export function formatDuration(openTime: string, closeTime: string): string {
  const [oh, om] = parseTime(openTime);
  const [ch, cm] = parseTime(closeTime);
  const mins = ch * 60 + cm - (oh * 60 + om);
  if (mins <= 0) return '0 h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}
