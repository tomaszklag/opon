import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { t, Heading, EmptyState, BookingCard, ChipFilter } from '@opony/design-system-native';
import { useState } from 'react';
import { useBookings } from '@/hooks/bookings/use-bookings';
import type { AppBooking } from '@/api/bookings';

type StatusFilter = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | null;

const STATUS_FILTER_OPTIONS = [
  { value: null as StatusFilter, label: 'Wszystkie' },
  { value: 'PENDING' as StatusFilter, label: 'Oczekuje' },
  { value: 'CONFIRMED' as StatusFilter, label: 'Potwierdzone' },
  { value: 'COMPLETED' as StatusFilter, label: 'Zrealizowane' },
  { value: 'CANCELLED' as StatusFilter, label: 'Anulowane' },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  const {
    data: bookings,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useBookings(statusFilter ?? undefined);

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={bookings ?? []}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={t.colors.accent} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Heading variant="h1">Moje rezerwacje</Heading>
          <View style={styles.filterWrap}>
            <ChipFilter
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </View>
        </View>
      }
      renderItem={({ item }: { item: AppBooking }) => (
        <View style={styles.cardWrap}>
          <BookingCard
            bookingCode={item.bookingCode}
            providerName={item.provider.name}
            startAt={item.slot.startAt}
            status={item.status}
            onPress={() => router.push(`/(app)/bookings/${item.id}` as never)}
          />
        </View>
      )}
      ListEmptyComponent={
        isError ? (
          <EmptyState
            title="Błąd ładowania"
            description="Nie udało się pobrać rezerwacji. Sprawdź połączenie i spróbuj ponownie."
            ctaLabel="Spróbuj ponownie"
            onCtaPress={() => refetch()}
          />
        ) : isLoading ? null : (
          <EmptyState
            title="Brak rezerwacji"
            description={
              statusFilter
                ? 'Nie masz rezerwacji z wybranym statusem.'
                : 'Nie masz jeszcze żadnych rezerwacji. Znajdź warsztat i umów się na wizytę.'
            }
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: t.colors.bg,
  },
  listContent: {
    paddingBottom: t.spacing[8],
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[6],
    paddingBottom: t.spacing[2],
    gap: t.spacing[2],
  },
  filterWrap: {
    marginHorizontal: -t.spacing[4],
    marginTop: t.spacing[2],
  },
  cardWrap: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[2],
  },
});
