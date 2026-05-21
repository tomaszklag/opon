export interface Holiday {
  date: string; // ISO "YYYY-MM-DD"
  name: string;
}

export const PL_HOLIDAYS: Holiday[] = [
  // 2026
  { date: '2026-01-01', name: 'Nowy Rok' },
  { date: '2026-01-06', name: 'Trzech Króli' },
  { date: '2026-04-05', name: 'Wielkanoc' },
  { date: '2026-04-06', name: 'Pon. wielkanocny' },
  { date: '2026-05-01', name: 'Święto Pracy' },
  { date: '2026-05-03', name: 'Konstytucja 3 Maja' },
  { date: '2026-05-24', name: 'Zielone Świątki' },
  { date: '2026-06-04', name: 'Boże Ciało' },
  { date: '2026-08-15', name: 'Wniebowzięcie NMP' },
  { date: '2026-11-01', name: 'Wszystkich Świętych' },
  { date: '2026-11-11', name: 'Niepodległość' },
  { date: '2026-12-25', name: 'Boże Narodzenie' },
  { date: '2026-12-26', name: 'Boże Narodzenie (2)' },
  // 2027
  { date: '2027-01-01', name: 'Nowy Rok' },
  { date: '2027-01-06', name: 'Trzech Króli' },
  { date: '2027-03-28', name: 'Wielkanoc' },
  { date: '2027-03-29', name: 'Pon. wielkanocny' },
  { date: '2027-05-01', name: 'Święto Pracy' },
  { date: '2027-05-03', name: 'Konstytucja 3 Maja' },
];

/** O(1) lookup: ISO date → holiday name */
export const HOLIDAY_MAP: Map<string, string> = new Map(PL_HOLIDAYS.map((h) => [h.date, h.name]));

export function getUpcomingHolidays(maxCount = 5): Holiday[] {
  const today = new Date().toISOString().slice(0, 10);
  return PL_HOLIDAYS.filter((h) => h.date >= today).slice(0, maxCount);
}
