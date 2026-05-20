import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
  t,
  Heading,
  Text,
  EmptyState,
  ProviderCard,
  ChipFilter,
} from '@opony/design-system-native';
import { useVehicles } from '@/hooks/users/use-vehicles';
import { useProviders } from '@/hooks/providers/use-providers';
import { useVehicleStore } from '@/stores/vehicle.store';
import type { AppProvider, ListProvidersParams } from '@/api/providers';

type TypeFilter = 'MOBILE' | 'STATIONARY' | 'BOTH' | null;

const TYPE_FILTER_OPTIONS = [
  { value: null as TypeFilter, label: 'Wszystkie' },
  { value: 'MOBILE' as TypeFilter, label: 'Dojazd' },
  { value: 'STATIONARY' as TypeFilter, label: 'Stacjonarny' },
  { value: 'BOTH' as TypeFilter, label: 'Dojazd + Stacjonarny' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { selectedVehicleId, setSelectedVehicleId } = useVehicleStore();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(null);

  const { data: vehicles, isLoading: vehiclesLoading, isError: vehiclesError } = useVehicles();
  const hasVehicles = !!vehicles && vehicles.length > 0;

  // Wyczyść selectedVehicleId jeśli pojazd został usunięty
  useEffect(() => {
    if (vehicles && selectedVehicleId && !vehicles.find((v) => v.id === selectedVehicleId)) {
      setSelectedVehicleId(null);
    }
  }, [vehicles, selectedVehicleId, setSelectedVehicleId]);

  const params: ListProvidersParams = {
    ...(typeFilter ? { type: typeFilter } : {}),
    limit: 30,
  };

  const {
    data: providersData,
    isLoading: providersLoading,
    isRefetching,
    refetch,
  } = useProviders(params, { enabled: hasVehicles });

  const providers = providersData?.data ?? [];

  if (vehiclesLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={t.colors.accent} />
      </View>
    );
  }

  if (vehiclesError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading variant="h1" color="accent">
            Opony.app
          </Heading>
        </View>
        <EmptyState
          title="Błąd ładowania"
          description="Nie udało się pobrać danych. Sprawdź połączenie i spróbuj ponownie."
          ctaLabel="Spróbuj ponownie"
          onCtaPress={() => router.replace('/' as never)}
        />
      </View>
    );
  }

  if (!hasVehicles) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading variant="h1" color="accent">
            Opony.app
          </Heading>
        </View>
        <EmptyState
          title="Nie masz jeszcze pojazdu"
          description="Dodaj pojazd, aby zobaczyć dostępne warsztaty w Twojej okolicy."
          ctaLabel="Dodaj pojazd"
          onCtaPress={() => router.push('/(app)/onboarding/vehicle' as never)}
        />
      </View>
    );
  }

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId) ?? vehicles?.[0];

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={providers}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={t.colors.accent} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Heading variant="h1" color="accent">
            Opony.app
          </Heading>
          {selectedVehicle ? (
            <Text variant="bodySmall" color="textSecondary">
              {selectedVehicle.make} {selectedVehicle.model} · {selectedVehicle.tireSize}
            </Text>
          ) : null}
          <View style={styles.filterWrap}>
            <ChipFilter options={TYPE_FILTER_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
          </View>
        </View>
      }
      renderItem={({ item }: { item: AppProvider }) => (
        <View style={styles.cardWrap}>
          <ProviderCard
            id={item.id}
            name={item.name}
            type={item.type}
            logoUrl={item.logoUrl}
            tagline={item.tagline}
            address={item.address}
            serviceRadiusKm={item.serviceRadiusKm}
            avgRating={item.avgRating}
            reviewCount={item.reviewCount}
            onPress={() => router.push(`/(app)/providers/${item.id}` as never)}
          />
        </View>
      )}
      ListEmptyComponent={
        providersLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={t.colors.accent} />
          </View>
        ) : (
          <EmptyState
            title="Brak warsztatów"
            description="W tej chwili nie ma dostępnych warsztatów dla wybranych filtrów."
            ctaLabel="Odśwież"
            onCtaPress={() => refetch()}
          />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
