import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { t, Heading, Text, Input, Button, useToast } from '@opony/design-system-native';
import { loginSchema, type LoginForm } from '@/schemas/auth.schema';
import { requestOtp } from '@/api/auth';
import { ApiError } from '@/lib/error';

export default function LoginScreen() {
  const router = useRouter();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '+48' },
  });

  const onSubmit = async ({ phone }: LoginForm) => {
    setLoading(true);
    try {
      await requestOtp({ phone });
      router.push({ pathname: '/(auth)/otp' as never, params: { phone } });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.getMessage() : 'Nie udało się wysłać kodu. Spróbuj ponownie.';
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Heading variant="display" color="accent">
            OPONY
          </Heading>
          <Heading variant="h1">Zaloguj się</Heading>
          <Text variant="body" color="textSecondary" style={styles.subtitle}>
            Podaj swój numer telefonu. Wyślemy Ci kod weryfikacyjny.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Numer telefonu"
                placeholder="+48 XXX XXX XXX"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.phone?.message}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          >
            Wyślij kod SMS
          </Button>
        </View>

        <Text variant="caption" color="textMuted" align="center" style={styles.terms}>
          Kontynuując, zgadzasz się z naszym regulaminem i polityką prywatności.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.colors.bg },
  container: {
    flexGrow: 1,
    padding: t.spacing[6],
    justifyContent: 'center',
    gap: t.spacing[8],
  },
  header: { gap: t.spacing[3] },
  subtitle: { marginTop: t.spacing[1] },
  form: { gap: t.spacing[4] },
  submitBtn: { marginTop: t.spacing[2] },
  terms: { paddingHorizontal: t.spacing[4] },
});
