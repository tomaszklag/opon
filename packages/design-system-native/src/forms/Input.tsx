import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
  ref?: React.Ref<TextInput>;
}

export const Input = React.forwardRef<TextInput, InputProps>(function InputComponent(
  props: InputProps,
  ref: React.Ref<TextInput>,
) {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    error,
    hint,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    autoComplete,
    leftIcon,
    rightIcon,
    onRightIconPress,
    disabled = false,
    multiline = false,
    numberOfLines,
    maxLength,
    style,
    autoFocus,
    returnKeyType,
    onSubmitEditing,
  } = props;
  const [focused, setFocused] = useState(false);

  const borderColor = error ? t.colors.danger : focused ? t.colors.accentBorder : t.colors.border;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text variant="label" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.inputWrap, { borderColor }, disabled && styles.inputWrapDisabled]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
            multiline ? styles.inputMultiline : null,
          ]}
          placeholder={placeholder}
          placeholderTextColor={t.colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete as any}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          autoFocus={autoFocus}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon} hitSlop={8}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" color="danger" style={styles.message}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted" style={styles.message}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: t.spacing[1] },
  label: { marginBottom: t.spacing[1] },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.colors.surface,
    borderWidth: 1,
    borderRadius: t.radius.md,
    minHeight: 48,
  },
  inputWrapDisabled: { opacity: 0.5 },
  input: {
    flex: 1,
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.body,
    fontSize: 16,
  },
  inputWithLeft: { paddingLeft: t.spacing[2] },
  inputWithRight: { paddingRight: t.spacing[2] },
  inputMultiline: { paddingTop: t.spacing[3], textAlignVertical: 'top' },
  leftIcon: { paddingLeft: t.spacing[3] },
  rightIcon: { paddingRight: t.spacing[3] },
  message: { marginTop: t.spacing[1] },
});
