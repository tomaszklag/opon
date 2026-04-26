export function rimLabel(min: number, max: number): string {
  if (min === max) return `${min} cali`;
  return `${min}–${max} cali`;
}
