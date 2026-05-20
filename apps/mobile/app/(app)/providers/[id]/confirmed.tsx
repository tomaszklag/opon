import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t, Text, Heading, Button, Spinner, EmptyState } from '@opony/design-system-native';
import { useBooking } from '@/hooks/bookings/use-bookings';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const time = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
}

export default function ConfirmedScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();

  const { data: booking, isLoading, isError } = useBooking(bookingId);

  if (isError) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Błąd"
          description="Nie udało się pobrać szczegółów rezerwacji."
          ctaLabel="Wróć"
          onCtaPress={() => router.back()}
        />
      </View>
    );
  }

  if (isLoading || !booking) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const isPending = booking.status === 'PENDING';

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Heading variant="h1" color="success">
            ✓
          </Heading>
        </View>

        <Heading variant="h1" align="center">
          Rezerwacja złożona!
        </Heading>

        <View style={styles.codeBox}>
          <Text variant="label" color="textMuted" align="center">
            KOD REZERWACJI
          </Text>
          <Text variant="body" weight="semibold" color="accent" align="center" style={styles.code}>
            {booking.bookingCode}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textMuted" style={styles.detailLabel}>
              Warsztat
            </Text>
            <Text variant="bodySmall" color="textPrimary" style={styles.detailValue}>
              {booking.provider.name}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textMuted" style={styles.detailLabel}>
              Termin
            </Text>
            <Text variant="bodySmall" color="textPrimary" style={styles.detailValue}>
              {formatDateTime(booking.slot.startAt)}
            </Text>
          </View>
        </View>

        {isPending ? (
          <View style={styles.pendingNote}>
            <Text variant="bodySmall" color="textSecondary" align="center">
              Czekamy na potwierdzenie warsztatu. Powiadomimy Cię o zmianie statusu.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push(`/(app)/bookings/${booking.id}` as never)}
        >
          Szczegóły rezerwacji
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.replace('/(app)/(tabs)' as never)}
        >
          Wróć do strony głównej
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.colors.bg,
    justifyContent: 'space-between',
    padding: t.spacing[6],
  },
  center: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[6],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    paddingHorizontal: t.spacing[8],
    paddingVertical: t.spacing[4],
    alignItems: 'center',
    gap: t.spacing[2],
    width: '100%',
  },
  code: {
    letterSpacing: 2,
  },
  details: {
    width: '100%',
    gap: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    paddingTop: t.spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    gap: t.spacing[3],
  },
  detailLabel: { width: 70 },
  detailValue: { flex: 1 },
  pendingNote: {
    backgroundColor: t.colors.warningMuted,
    borderRadius: t.radius.md,
    padding: t.spacing[4],
    width: '100%',
  },
  actions: {
    gap: t.spacing[3],
  },
});
