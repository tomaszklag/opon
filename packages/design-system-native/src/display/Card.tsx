import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { t } from '../tokens.native';

type CardVariant = 'default' | 'flat';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof t.spacing;
}

export function Card({ children, onPress, variant = 'default', style, padding = 4 }: CardProps) {
  const content = (
    <View style={[styles.base, styles[variant], { padding: t.spacing[padding] }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderColor: t.colors.hairline,
  },
  default: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  flat: {},
  pressed: { opacity: 0.9 },
});
