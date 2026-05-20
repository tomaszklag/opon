import { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { t, Spinner, EmptyState } from '@opony/design-system-native';
import { useProviders } from '@/hooks/providers/use-providers';

const INITIAL_REGION = {
  latitude: 49.625,
  longitude: 20.6944,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Hardcoded coords dla mock providerów (provider-1, provider-2, provider-3)
const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {
  'provider-1': { lat: 49.627, lng: 20.69 },
  'provider-2': { lat: 49.62, lng: 20.71 },
  'provider-3': { lat: 49.63, lng: 20.68 },
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const { data: providersData, isLoading, isError, refetch } = useProviders({}, {});

  if (isError) {
    return (
      <View style={styles.center}>
        <EmptyState
          title="Nie udało się załadować mapy"
          description="Sprawdź połączenie z internetem i spróbuj ponownie."
          ctaLabel="Spróbuj ponownie"
          onCtaPress={() => refetch()}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner size="lg" centered />
      </View>
    );
  }

  const providers = providersData?.data ?? [];

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton
      >
        {providers.map((provider) => {
          const coords =
            provider.cityCenterLat && provider.cityCenterLng
              ? { lat: provider.cityCenterLat, lng: provider.cityCenterLng }
              : MOCK_COORDS[provider.id];

          if (!coords) return null;

          return (
            <Marker
              key={provider.id}
              coordinate={{ latitude: coords.lat, longitude: coords.lng }}
              title={provider.name}
              description={provider.address ?? undefined}
              pinColor={t.colors.accent}
              onCalloutPress={() => router.push(`/(app)/providers/${provider.id}` as never)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
