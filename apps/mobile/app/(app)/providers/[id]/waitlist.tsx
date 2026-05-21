import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  t,
  Text,
  Heading,
  Button,
  Spinner,
  EmptyState,
  useToast,
} from '@opony/design-system-native';
import { useProvider, useJoinWaitlist } from '@/hooks/providers/use-provider';
import { ApiError } from '@/lib/error';

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

export default function WaitlistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { show: showToast } = useToast();
  const [joined, setJoined] = useState(false);

  const { data: provider, isLoading, isError, refetch } = useProvider(id);
  const { mutateAsync: joinWaitlist, isPending } = useJoinWaitlist();

  if (isError) {
    return (
      <View style={styles.screen}>
        <BackButton />
        <EmptyState
          title="Błąd"
          description="Nie udało się załadować danych warsztatu."
          ctaLabel="Spróbuj ponownie"
          onCtaPress={() => refetch()}
        />
      </View>
    );
  }

  if (isLoading || !provider) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const handleJoin = async () => {
    try {
      await joinWaitlist(id);
      setJoined(true);
    } catch (err) {
      if (err instanceof ApiError && err.isConflict()) {
        // Already on waitlist — treat as success
        setJoined(true);
        return;
      }
      const message =
        err instanceof ApiError ? err.getMessage() : 'Nie udało się dołączyć do listy.';
      showToast(message, 'error');
    }
  };

  if (joined) {
    return (
      <View style={styles.screen}>
        <BackButton />
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Heading variant="h1" color="success">
              ✓
            </Heading>
          </View>
          <Heading variant="h2" align="center">
            Jesteś na liście!
          </Heading>
          <Text variant="body" color="textSecondary" align="center">
            Powiadomimy Cię, gdy pojawi się wolny termin w warsztacie{' '}
            <Text variant="body" color="textPrimary" weight="semibold">
              {provider.name}
            </Text>
            .
          </Text>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace('/(app)/(tabs)' as never)}
          >
            Wróć do strony głównej
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.push(`/(app)/providers/${id}` as never)}
          >
            Wróć do warsztatu
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <BackButton />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Text variant="body" style={styles.clockEmoji}>
            🕐
          </Text>
        </View>

        <Heading variant="h2" align="center">
          Brak wolnych terminów
        </Heading>

        <Text variant="body" color="textSecondary" align="center">
          W warsztacie{' '}
          <Text variant="body" color="textPrimary" weight="semibold">
            {provider.name}
          </Text>{' '}
          nie ma obecnie dostępnych terminów.
        </Text>

        <View style={styles.infoBox}>
          <Text variant="bodySmall" color="textSecondary" align="center">
            Dołącz do listy oczekujących — wyślemy Ci powiadomienie gdy zwolni się termin.
          </Text>
        </View>

        <Button variant="primary" size="lg" fullWidth loading={isPending} onPress={handleJoin}>
          Dołącz do listy oczekujących
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          disabled={isPending}
          onPress={() => router.back()}
        >
          Wróć
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing[6],
    gap: t.spacing[5],
  },
  iconWrap: {
    width: t.spacing[16],
    height: t.spacing[16],
    borderRadius: t.radius.full,
    backgroundColor: t.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  infoBox: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    padding: t.spacing[4],
    width: '100%',
  },
});
