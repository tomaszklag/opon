import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { t } from '../tokens.native';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'accent' | 'white' | 'muted';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  centered?: boolean;
}

const rnSize: Record<SpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

const colorMap: Record<SpinnerColor, string> = {
  accent: t.colors.accent,
  white: t.colors.textPrimary,
  muted: t.colors.textMuted,
};

export function Spinner({ size = 'md', color = 'accent', centered = false }: SpinnerProps) {
  const indicator = <ActivityIndicator size={rnSize[size]} color={colorMap[color]} />;
  if (centered) return <View style={styles.centered}>{indicator}</View>;
  return indicator;
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
