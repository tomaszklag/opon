import { colors, spacing as rawSpacing, radius as rawRadius } from '@opony/design-tokens';

const px = (v: string): number => parseInt(v, 10);

export const t = {
  colors,
  spacing: {
    1: px(rawSpacing[1]),
    2: px(rawSpacing[2]),
    3: px(rawSpacing[3]),
    4: px(rawSpacing[4]),
    5: px(rawSpacing[5]),
    6: px(rawSpacing[6]),
    8: px(rawSpacing[8]),
    10: px(rawSpacing[10]),
    12: px(rawSpacing[12]),
    16: px(rawSpacing[16]),
  } as const,
  radius: {
    sm: px(rawRadius.sm),
    md: px(rawRadius.md),
    lg: px(rawRadius.lg),
    xl: px(rawRadius.xl),
    full: px(rawRadius.full),
  } as const,
  fontFamily: {
    display: 'BebasNeue',
    body: 'Archivo',
    mono: 'JetBrainsMono',
  } as const,
} as const;

export type { ColorKey } from '@opony/design-tokens';
