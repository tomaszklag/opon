import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

export function Checkbox({ value, onValueChange, label, error, disabled = false }: CheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value, disabled }}
        style={styles.row}
      >
        <View
          style={[
            styles.box,
            value ? styles.boxChecked : null,
            error ? styles.boxError : null,
            disabled ? styles.boxDisabled : null,
          ]}
        >
          {value ? <View style={styles.checkmark} /> : null}
        </View>
        {label ? (
          <View style={styles.labelWrap}>
            {typeof label === 'string' ? (
              <Text variant="body" color="textSecondary">
                {label}
              </Text>
            ) : (
              label
            )}
          </View>
        ) : null}
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: t.spacing[1] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: t.spacing[3] },
  box: {
    width: 20,
    height: 20,
    borderRadius: t.radius.sm,
    borderWidth: 1.5,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: t.spacing[1],
    flexShrink: 0,
  },
  boxChecked: {
    borderColor: t.colors.accent,
    backgroundColor: t.colors.accent,
  },
  boxError: { borderColor: t.colors.danger },
  boxDisabled: { opacity: 0.5 },
  checkmark: {
    width: 10,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: t.colors.textOnAccent,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  labelWrap: { flex: 1 },
  errorText: { marginLeft: 32 },
});
