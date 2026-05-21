import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { t, Text } from '@opony/design-system-native';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsub;
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text variant="bodySmall" color="textOnAccent" weight="medium">
        Brak połączenia z internetem
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: t.colors.danger,
    paddingVertical: t.spacing[2],
    paddingHorizontal: t.spacing[4],
    alignItems: 'center',
    zIndex: 1000,
  },
});
