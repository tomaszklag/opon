import React from 'react';
import { View, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';
import type { ColorKey } from '../tokens.native';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: ColorKey }> = {
  accent: { bg: t.colors.accentMuted, text: 'accent' },
  success: { bg: 'rgba(46, 224, 160, 0.14)', text: 'success' },
  warning: { bg: 'rgba(255, 176, 32, 0.14)', text: 'warning' },
  danger: { bg: 'rgba(255, 87, 87, 0.14)', text: 'danger' },
  info: { bg: 'rgba(59, 142, 234, 0.14)', text: 'info' },
  neutral: { bg: t.colors.surfaceRaised, text: 'textSecondary' },
};

export function Badge({ label, variant = 'neutral', size = 'md' }: BadgeProps) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.base, styles[size], { backgroundColor: bg }]}>
      <Text variant="caption" color={text} weight="medium">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: t.radius.full,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: t.spacing[2], paddingVertical: 2 },
  md: { paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[1] },
});
