import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { t, Text } from '@opony/design-system-native';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text variant="body" color="textMuted">
        Rezerwacja {id} — Sprint 5 FE-mobile-3
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
