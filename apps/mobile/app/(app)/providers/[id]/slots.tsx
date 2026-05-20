import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t, Text, Heading, Button } from '@opony/design-system-native';

export default function SlotsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Heading variant="h2" align="center">
        Wybierz termin
      </Heading>
      <Text variant="body" color="textMuted" align="center">
        Warsztat: {id}
      </Text>
      <Text variant="bodySmall" color="textMuted" align="center">
        Sprint 5 — FE-mobile-3
      </Text>
      <Button variant="ghost" size="sm" onPress={() => router.back()}>
        Wróć
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing[6],
    gap: t.spacing[4],
  },
});
