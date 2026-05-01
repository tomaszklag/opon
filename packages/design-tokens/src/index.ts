export const colors = {
  bg: '#0A0B0E',
  bgTintTop: '#12141A',
  surface: '#14171D',
  surfaceRaised: '#1B1E26',
  surfaceHover: '#23272F',
  border: '#262A34',
  borderStrong: '#363B47',
  hairline: 'rgba(255, 255, 255, 0.06)',
  textPrimary: '#F5F4EF',
  textSecondary: '#9EA2AD',
  textMuted: '#60646F',
  textOnAccent: '#0A0B0E',
  accent: '#FF6B1A',
  accentHover: '#FF8039',
  accentMuted: 'rgba(255, 107, 26, 0.14)',
  accentBorder: 'rgba(255, 107, 26, 0.32)',
  accentGlow: 'rgba(255, 107, 26, 0.45)',
  success: '#2EE0A0',
  warning: '#FFB020',
  danger: '#FF5757',
  info: '#3B8EEA',
} as const;

export const typography = {
  fontDisplay: "'Bebas Neue', sans-serif",
  fontBody: "'Archivo', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 3px rgba(0,0,0,0.4)',
  md: '0 4px 12px rgba(0,0,0,0.5)',
  lg: '0 8px 24px rgba(0,0,0,0.6)',
  accent: '0 0 20px rgba(255, 107, 26, 0.45)',
} as const;

export type ColorKey = keyof typeof colors;
export type SpacingKey = keyof typeof spacing;
