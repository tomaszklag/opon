import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { t, Heading, Text, Input, Button, useToast } from '@opony/design-system-native';
import { vehicleSchema, type VehicleForm } from '@/schemas/profile.schema';
import { addVehicle } from '@/api/users';
import { useAuthStore } from '@/stores/auth.store';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ApiError } from '@/lib/error';

export default function OnboardingVehicleScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { setPendingOnboarding } = useAuthStore();
  const qc = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      tireSize: '',
      nickname: '',
    },
  });

  const mutation = useMutation({
    mutationFn: addVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vehicles.all });
      setPendingOnboarding(false);
      router.replace('/(app)/' as never);
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.getMessage() : 'Nie udało się dodać pojazdu.';
      show(msg, 'error');
    },
  });

  const onSubmit = (data: VehicleForm) => {
    mutation.mutate({
      make: data.make,
      model: data.model,
      year: data.year,
      tireSize: data.tireSize,
      nickname: data.nickname || undefined,
    });
  };

  const handleSkip = () => {
    setPendingOnboarding(false);
    router.replace('/(app)/' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="caption" color="accent" weight="semibold">
            KROK 2 z 2
          </Text>
          <Heading variant="h1">Twój pojazd</Heading>
          <Text variant="body" color="textSecondary">
            Dodaj pojazd, żebyśmy mogli pokazać Ci pasujące oferty i terminy.
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="make"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Marka"
                placeholder="np. Toyota"
                value={value}
                onChangeText={onChange}
                error={errors.make?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="model"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Model"
                placeholder="np. Corolla"
                value={value}
                onChangeText={onChange}
                error={errors.model?.message}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="year"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Rok produkcji"
                placeholder={String(new Date().getFullYear())}
                value={String(value)}
                onChangeText={(val) => onChange(parseInt(val, 10) || 0)}
                error={errors.year?.message}
                keyboardType="numeric"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="tireSize"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Rozmiar opon"
                placeholder="205/55 R16"
                value={value}
                onChangeText={onChange}
                error={errors.tireSize?.message}
                hint="Format: szerokość/profil R średnica (np. 205/55 R16)"
                autoCapitalize="characters"
                returnKeyType="next"
              />
            )}
          />
          <Controller
            control={control}
            name="nickname"
            render={({ field: { value, onChange } }) => (
              <Input
                label="Nazwa pojazdu (opcjonalnie)"
                placeholder="np. Moja Toyota"
                value={value}
                onChangeText={onChange}
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
          Dodaj pojazd i zacznij
        </Button>
        <Button variant="ghost" size="md" fullWidth onPress={handleSkip}>
          Pomiń na razie
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
    gap: t.spacing[2],
  },
});
