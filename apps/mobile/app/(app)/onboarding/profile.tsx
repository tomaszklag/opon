import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { t, Heading, Text, Input, Button, useToast } from '@opony/design-system-native';
import { profileSchema, type ProfileForm } from '@/schemas/profile.schema';
import { updateMe } from '@/api/users';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/lib/error';

export default function OnboardingProfileScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { setUser } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: '', lastName: '', email: '' },
  });

  const mutation = useMutation({
    mutationFn: updateMe,
    onSuccess: (user) => {
      setUser(user);
      router.push('/(app)/onboarding/vehicle' as never);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.getMessage() : 'Nie udało się zapisać profilu.';
      show(msg, 'error');
    },
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="caption" color="accent" weight="semibold">
            KROK 1 z 2
          </Text>
          <Heading variant="h1">Twój profil</Heading>
          <Text variant="body" color="textSecondary">
            Podaj swoje dane, żebyśmy wiedzieli jak się do Ciebie zwracać.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Imię"
                placeholder="np. Jan"
                value={value}
                onChangeText={onChange}
                error={errors.firstName?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Nazwisko"
                placeholder="np. Kowalski"
                value={value}
                onChangeText={onChange}
                error={errors.lastName?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Email (opcjonalnie)"
                placeholder="jan@example.com"
                value={value}
                onChangeText={onChange}
                error={errors.email?.message}
                keyboardType="email-address"
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={mutation.isPending}
          onPress={handleSubmit(onSubmit)}
        >
          Dalej — Dodaj pojazd
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.colors.bg },
  container: { flexGrow: 1, padding: t.spacing[6], gap: t.spacing[6] },
  header: { gap: t.spacing[3], paddingTop: t.spacing[6] },
  form: { gap: t.spacing[4] },
  footer: {
    padding: t.spacing[6],
    paddingBottom: t.spacing[8],
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.bg,
  },
});
