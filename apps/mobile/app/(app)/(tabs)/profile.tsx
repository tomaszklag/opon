import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { t, Heading, Text, Button, Card, Spinner, Badge } from '@opony/design-system-native';
import { useAuthStore } from '@/stores/auth.store';
import { getMe, getVehicles } from '@/api/users';
import { logout as logoutApi } from '@/api/auth';
import { QUERY_KEYS } from '@/constants/query-keys';
import { secureStorage } from '@/lib/secure-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: getMe,
    staleTime: 10 * 60 * 1000,
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: QUERY_KEYS.vehicles.all,
    queryFn: getVehicles,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    Alert.alert('Wylogowanie', 'Czy na pewno chcesz się wylogować?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Wyloguj',
        style: 'destructive',
        onPress: async () => {
          try {
            await logoutApi();
          } catch {
            /* ignore */
          }
          await secureStorage.clearAll();
          logout();
        },
      },
    ]);
  };

  const handleAddVehicle = () => router.push('/(app)/onboarding/vehicle' as never);

  if (profileLoading) return <Spinner centered />;

  const displayName = profile
    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.phone
    : (user?.phone ?? '');

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Heading variant="h2">{displayName}</Heading>
        <Text variant="body" color="textSecondary">
          {profile?.phone ?? user?.phone}
        </Text>
        {profile?.email ? (
          <Text variant="bodySmall" color="textMuted">
            {profile.email}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="label" color="textSecondary" weight="semibold">
            MOJE POJAZDY
          </Text>
          <Button variant="ghost" size="sm" onPress={handleAddVehicle}>
            + Dodaj
          </Button>
        </View>
        {vehiclesLoading ? <Spinner size="sm" /> : null}
        {vehicles?.length === 0 ? (
          <Card>
            <Text variant="body" color="textMuted" align="center">
              Brak pojazdów. Dodaj swój pojazd.
            </Text>
          </Card>
        ) : null}
        {vehicles?.map((v) => (
          <Card key={v.id}>
            <View style={styles.vehicleRow}>
              <View>
                <Text variant="body" weight="semibold">
                  {v.make} {v.model} {v.year}
                </Text>
                <Text variant="bodySmall" color="textSecondary">
                  {v.tireSize}
                </Text>
              </View>
              {v.nickname ? <Badge label={v.nickname} variant="neutral" /> : null}
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Button variant="secondary" size="md" fullWidth onPress={() => {}}>
          Regulamin
        </Button>
        <Button variant="secondary" size="md" fullWidth onPress={() => {}}>
          Polityka prywatności
        </Button>
        <Button variant="danger" size="md" fullWidth onPress={handleLogout}>
          Wyloguj się
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.colors.bg },
  container: {
    padding: t.spacing[6],
    gap: t.spacing[6],
    paddingTop: t.spacing[8],
  },
  header: { gap: t.spacing[2] },
  section: { gap: t.spacing[3] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
