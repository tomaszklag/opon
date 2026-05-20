import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

interface SlotPillProps {
  startAt: string;
  endAt: string;
  available: boolean;
  selected?: boolean;
  onPress?: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function SlotPill({ startAt, endAt, available, selected = false, onPress }: SlotPillProps) {
  return (
    <Pressable
      onPress={available ? onPress : undefined}
      disabled={!available}
      accessibilityRole="button"
      accessibilityState={{ disabled: !available, selected }}
      style={[styles.pill, selected && styles.selected, !available && styles.unavailable]}
    >
      <Text
        variant="bodySmall"
        weight={selected ? 'semibold' : 'regular'}
        color={selected ? 'textOnAccent' : available ? 'textPrimary' : 'textMuted'}
      >
        {formatTime(startAt)}–{formatTime(endAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    backgroundColor: t.colors.surface,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
    alignItems: 'center',
  },
  selected: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  unavailable: {
    backgroundColor: t.colors.surfaceRaised,
    opacity: 0.5,
  },
});
