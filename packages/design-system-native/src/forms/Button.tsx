import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';
import type { ColorKey } from '../tokens.native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const labelColor: Record<ButtonVariant, ColorKey> = {
  primary: 'textOnAccent',
  secondary: 'textPrimary',
  ghost: 'accent',
  danger: 'danger',
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  children,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? t.colors.textOnAccent : t.colors.accent}
        />
      ) : (
        <Text
          variant={size === 'sm' ? 'bodySmall' : 'body'}
          color={labelColor[variant]}
          weight="semibold"
          style={size === 'lg' ? styles.labelLg : undefined}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },

  primary: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  secondary: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    borderColor: t.colors.danger,
  },

  sm: { paddingVertical: t.spacing[2], paddingHorizontal: t.spacing[3], minHeight: 36 },
  md: { paddingVertical: t.spacing[3], paddingHorizontal: t.spacing[4], minHeight: 48 },
  lg: { paddingVertical: t.spacing[4], paddingHorizontal: t.spacing[6], minHeight: 56 },

  labelLg: { fontSize: 18, lineHeight: 24 },
});
