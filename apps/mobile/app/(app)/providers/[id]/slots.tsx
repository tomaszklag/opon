import { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  t,
  Text,
  Heading,
  Button,
  Spinner,
  Input,
  SlotPill,
  EmptyState,
  useToast,
} from '@opony/design-system-native';
import { useProvider, useProviderSlots } from '@/hooks/providers/use-provider';
import { useVehicles } from '@/hooks/users/use-vehicles';
import { useVehicleStore } from '@/stores/vehicle.store';
import { useCreateBooking } from '@/hooks/bookings/use-bookings';
import { ApiError } from '@/lib/error';

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function generateDays(count = 14): { label: string; shortLabel: string; value: string }[] {
  const days: { label: string; shortLabel: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      label: d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }),
      shortLabel: d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }),
      value: toLocalDateString(d),
    });
  }
  return days;
}

const DAYS = generateDays(14);

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

export default function SlotsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show: showToast } = useToast();

  const [selectedDate, setSelectedDate] = useState(DAYS[0].value);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [address, setAddress] = useState('');

  const { data: provider, isLoading: providerLoading } = useProvider(id);
  const {
    data: slots,
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = useProviderSlots(id, selectedDate);

  const { selectedVehicleId } = useVehicleStore();
  const { data: vehicles } = useVehicles();
  const vehicle = vehicles?.find((v) => v.id === selectedVehicleId) ?? vehicles?.[0];

  const { mutateAsync: createBooking, isPending: isCreating } = useCreateBooking();

  const isMobile = provider?.type === 'MOBILE' || provider?.type === 'BOTH';
  const canBook = !!selectedSlotId && !!vehicle && (!isMobile || address.trim().length > 0);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlotId(null);
  };

  const handleBook = async () => {
    if (!selectedSlotId || !vehicle) return;

    try {
      const booking = await createBooking({
        providerId: id,
        slotId: selectedSlotId,
        vehicleId: vehicle.id,
        ...(isMobile && address.trim() ? { address: address.trim() } : {}),
      });
      router.replace(`/(app)/providers/${id}/confirmed?bookingId=${booking.id}` as never);
    } catch (err) {
      if (err instanceof ApiError && err.isConflict()) {
        showToast('Ten termin jest już zajęty. Wybierz inny.', 'error');
        setSelectedSlotId(null);
        refetchSlots();
      } else {
        showToast('Nie udało się zarezerwować terminu. Spróbuj ponownie.', 'error');
      }
    }
  };

  if (providerLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const selectedDay = DAYS.find((d) => d.value === selectedDate);

  return (
    <View style={styles.screen}>
      <BackButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Heading variant="h2">{provider?.name ?? 'Wybierz termin'}</Heading>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            DATA
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateRow}
          >
            {DAYS.map((day) => {
              const isSelected = day.value === selectedDate;
              return (
                <Pressable
                  key={day.value}
                  onPress={() => handleDateSelect(day.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                >
                  <Text
                    variant="bodySmall"
                    weight={isSelected ? 'semibold' : 'regular'}
                    color={isSelected ? 'textOnAccent' : 'textSecondary'}
                  >
                    {day.shortLabel}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Slots grid */}
        <View style={styles.section}>
          <Text variant="label" color="textSecondary" style={styles.sectionLabel}>
            {selectedDay?.label.toUpperCase()}
          </Text>
          {slotsLoading ? (
            <View style={styles.slotsLoading}>
              <Spinner />
            </View>
          ) : slotsError ? (
            <EmptyState
              title="Błąd ładowania"
              description="Nie udało się pobrać dostępnych terminów."
              ctaLabel="Spróbuj ponownie"
              onCtaPress={() => refetchSlots()}
            />
          ) : !slots || slots.length === 0 ? (
            <Text variant="bodySmall" color="textMuted">
              Brak dostępnych terminów na ten dzień.
            </Text>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map((slot) => (
                <SlotPill
                  key={slot.id}
                  startAt={slot.startAt}
                  endAt={slot.endAt}
                  available={slot.available}
                  selected={slot.id === selectedSlotId}
                  onPress={() => setSelectedSlotId(slot.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* No vehicle warning */}
        {vehicles !== undefined && !vehicle ? (
          <View style={styles.section}>
            <View style={styles.noVehicleNote}>
              <Text variant="bodySmall" color="warning">
                Brak pojazdu — dodaj pojazd w profilu, aby móc zarezerwować termin.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Address for mobile providers */}
        {isMobile ? (
          <View style={styles.section}>
            <Input
              label="Adres dojazdu"
              placeholder="ul. Przykładowa 1, Nowy Sącz"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
            />
          </View>
        ) : null}

        <View style={styles.ctaSpace} />
      </ScrollView>

      <View style={styles.ctaBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canBook}
          loading={isCreating}
          onPress={handleBook}
        >
          Zarezerwuj
        </Button>
      </View>
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
  },
  backBtn: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: t.spacing[4] },
  titleSection: {
    paddingHorizontal: t.spacing[4],
    paddingBottom: t.spacing[3],
  },
  section: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    gap: t.spacing[3],
  },
  sectionLabel: {
    letterSpacing: 0.8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: t.spacing[2],
    paddingRight: t.spacing[4],
  },
  dayChip: {
    borderRadius: t.radius.full,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    backgroundColor: t.colors.surface,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
  },
  dayChipSelected: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  slotsLoading: {
    paddingVertical: t.spacing[4],
    alignItems: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: t.spacing[2],
  },
  noVehicleNote: {
    backgroundColor: t.colors.warningMuted,
    borderRadius: t.radius.md,
    padding: t.spacing[3],
  },
  ctaSpace: { height: 96 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: t.colors.bg,
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    padding: t.spacing[4],
    paddingBottom: t.spacing[6],
  },
});
