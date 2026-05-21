import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Record<number, number>>({});

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((entry) => entry.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++counter;
      setToasts((prev: ToastEntry[]) => [...prev.slice(-2), { id, message, variant }]);
      timers.current[id] = setTimeout(() => remove(id), 3500) as unknown as number;
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View style={styles.container} pointerEvents="none">
        {toasts.map((entry) => (
          <ToastItem key={entry.id} entry={entry} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ entry }: { entry: ToastEntry }) {
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, []);

  const bgColor: Record<ToastVariant, string> = {
    success: t.colors.success,
    error: t.colors.danger,
    info: t.colors.info,
  };

  return (
    <Animated.View style={[styles.toast, { opacity, backgroundColor: bgColor[entry.variant] }]}>
      <Text variant="bodySmall" color="textOnAccent" weight="medium">
        {entry.message}
      </Text>
    </Animated.View>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: t.spacing[4],
    right: t.spacing[4],
    zIndex: 9999,
    gap: t.spacing[2],
    pointerEvents: 'none',
  },
  toast: {
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
