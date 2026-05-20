import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t, Text, Heading, Button, Badge, Spinner, useToast } from '@opony/design-system-native';
import { useBooking, useCancelBooking } from '@/hooks/bookings/use-bookings';
import { ApiError } from '@/lib/error';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje na potwierdzenie',
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.backBtn}
      accessibilityRole="button"
      accessibilityLabel="Wróć"
    >
      <Text variant="body" color="accent">
        ← Wróć
      </Text>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>
      {title.toUpperCase()}
    </Text>
  );
}

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show: showToast } = useToast();

  const { data: booking, isLoading, isError } = useBooking(id);
  const { mutateAsync: cancelBooking, isPending: isCancelling } = useCancelBooking();

  const handleCancel = async () => {
    try {
      await cancelBooking(id);
      showToast('Rezerwacja została anulowana.', 'success');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.getMessage() : 'Nie udało się anulować rezerwacji.';
      showToast(message, 'error');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View style={styles.center}>
        <BackButton />
        <Text variant="body" color="textSecondary">
          Nie udało się załadować rezerwacji.
        </Text>
      </View>
    );
  }

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const canRate = booking.status === 'COMPLETED';

  return (
    <View style={styles.screen}>
      <BackButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <Heading variant="h2" style={styles.code}>
              {booking.bookingCode}
            </Heading>
            <Badge label={STATUS_LABEL[booking.status]} variant={STATUS_VARIANT[booking.status]} />
          </View>
          {booking.status === 'PENDING' ? (
            <Text variant="bodySmall" color="textSecondary">
              Czekamy na potwierdzenie warsztatu.
            </Text>
          ) : null}
        </View>

        {/* Provider */}
        <View style={styles.section}>
          <SectionHeader title="Warsztat" />
          <Text variant="body" weight="semibold" color="textPrimary">
            {booking.provider.name}
          </Text>
          {booking.provider.address ? (
            <Text variant="bodySmall" color="textSecondary">
              {booking.provider.address}
            </Text>
          ) : null}
          {booking.provider.phone ? (
            <Pressable onPress={() => Linking.openURL(`tel:${booking.provider.phone}`)}>
              <Text variant="bodySmall" color="accent">
                {booking.provider.phone}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Slot */}
        <View style={styles.section}>
          <SectionHeader title="Termin" />
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textMuted" style={styles.infoLabel}>
              Data
            </Text>
            <Text variant="bodySmall" color="textPrimary">
              {formatDate(booking.slot.startAt)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textMuted" style={styles.infoLabel}>
              Godzina
            </Text>
            <Text variant="bodySmall" color="textPrimary">
              {formatTime(booking.slot.startAt)}–{formatTime(booking.slot.endAt)}
            </Text>
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.section}>
          <SectionHeader title="Pojazd" />
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textMuted" style={styles.infoLabel}>
              Rozmiar
            </Text>
            <Text variant="bodySmall" color="textPrimary">
              {booking.vehicleTireSize}
            </Text>
          </View>
        </View>

        {/* Note */}
        {booking.note ? (
          <View style={styles.section}>
            <SectionHeader title="Notatka" />
            <Text variant="bodySmall" color="textSecondary">
              {booking.note}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        {canCancel || canRate ? (
          <View style={styles.section}>
            {canRate ? (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onPress={() =>
                  router.push(
                    `/(app)/providers/${booking.provider.id}/rate?bookingId=${booking.id}` as never,
                  )
                }
              >
                Oceń wizytę
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                variant="danger"
                size="md"
                fullWidth
                loading={isCancelling}
                onPress={handleCancel}
              >
                Anuluj rezerwację
              </Button>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[4],
    padding: t.spacing[6],
  },
  backBtn: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: t.spacing[8] },
  hero: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    gap: t.spacing[2],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[3],
  },
  code: { flex: 1 },
  section: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    gap: t.spacing[2],
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: t.spacing[1],
  },
  infoRow: {
    flexDirection: 'row',
    gap: t.spacing[3],
  },
  infoLabel: { width: 70 },
});
