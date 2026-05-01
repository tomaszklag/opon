export type SizeTierValue = 'S' | 'M' | 'L';

const SIZE_TIER_LABELS: Record<SizeTierValue, string> = {
  S: 'S — do R15',
  M: 'M — R16–R17',
  L: 'L — R18+',
};

export function sizeTierLabel(sizeTier: SizeTierValue): string {
  return SIZE_TIER_LABELS[sizeTier] ?? sizeTier;
}
