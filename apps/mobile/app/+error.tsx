import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { t, Heading, Text, Button } from '@opony/design-system-native';

export default function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Heading variant="h2" color="danger" align="center">
          Ups, coś poszło nie tak
        </Heading>
        <Text variant="body" color="textSecondary" align="center">
          Przepraszamy za utrudnienia. Spróbuj ponownie lub wróć do strony głównej.
        </Text>
        {__DEV__ ? (
          <View style={styles.devError}>
            <Text variant="caption" color="textMuted">
              {error.message}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Button variant="primary" size="lg" fullWidth onPress={retry}>
          Spróbuj ponownie
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
    padding: t.spacing[6],
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[6],
  },
  devError: {
    backgroundColor: t.colors.surfaceRaised,
    borderRadius: t.radius.md,
    padding: t.spacing[4],
    width: '100%',
  },
  actions: {
    gap: t.spacing[3],
  },
});
