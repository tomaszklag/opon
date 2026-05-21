import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';
import { Badge } from './Badge';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface BookingCardProps {
  bookingCode: string;
  providerName: string;
  startAt: string;
  status: BookingStatus;
  onPress?: () => void;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  CANCELLED: 'Anulowana',
  COMPLETED: 'Zrealizowana',
};

const STATUS_VARIANT: Record<BookingStatus, 'warning' | 'success' | 'danger' | 'neutral'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

export function BookingCard({
  bookingCode,
  providerName,
  startAt,
  status,
  onPress,
}: BookingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text variant="label" color="textMuted">
          {bookingCode}
        </Text>
        <Badge label={STATUS_LABEL[status]} variant={STATUS_VARIANT[status]} size="sm" />
      </View>
      <Text variant="body" weight="semibold" color="textPrimary" numberOfLines={1}>
        {providerName}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {formatDateTime(startAt)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    padding: t.spacing[4],
    gap: t.spacing[1],
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing[1],
  },
});
