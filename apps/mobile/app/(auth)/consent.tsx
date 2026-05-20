import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { t, Heading, Text, Button, Checkbox, useToast } from '@opony/design-system-native';
import { postConsent } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/lib/error';

export default function ConsentScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { pendingOnboarding } = useAuthStore();

  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ terms: '', privacy: '' });

  const canSubmit = terms && privacy;

  const handleSubmit = async () => {
    const newErrors = {
      terms: terms ? '' : 'Akceptacja regulaminu jest wymagana',
      privacy: privacy ? '' : 'Akceptacja polityki prywatności jest wymagana',
    };
    setErrors(newErrors);
    if (!canSubmit) return;

    setLoading(true);
    try {
      await postConsent({
        termsAccepted: terms,
        privacyAccepted: privacy,
        marketingAccepted: marketing,
      });
      if (pendingOnboarding) {
        router.replace('/(app)/onboarding/profile' as never);
      } else {
        router.replace('/(app)/' as never);
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.getMessage() : 'Nie udało się zapisać zgód.';
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Heading variant="h1">Zgody i regulamin</Heading>
          <Text variant="body" color="textSecondary">
            Zanim zaczniesz korzystać z aplikacji, potrzebujemy Twojej akceptacji.
          </Text>
        </View>

        <View style={styles.checkboxes}>
          <Checkbox
            value={terms}
            onValueChange={setTerms}
            error={errors.terms}
            label={
              <Text variant="body" color="textSecondary">
                Akceptuję{' '}
                <Text variant="body" color="accent">
                  Regulamin
                </Text>{' '}
                aplikacji *
              </Text>
            }
          />
          <Checkbox
            value={privacy}
            onValueChange={setPrivacy}
            error={errors.privacy}
            label={
              <Text variant="body" color="textSecondary">
                Akceptuję{' '}
                <Text variant="body" color="accent">
                  Politykę prywatności
                </Text>{' '}
                i przetwarzanie danych osobowych *
              </Text>
            }
          />
          <Checkbox
            value={marketing}
            onValueChange={setMarketing}
            label={
              <Text variant="body" color="textSecondary">
                Zgadzam się na otrzymywanie ofert marketingowych (opcjonalne)
              </Text>
            }
          />
        </View>

        <Text variant="caption" color="textMuted">
          * Pola wymagane
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" fullWidth loading={loading} onPress={handleSubmit}>
          Akceptuję i przechodzę dalej
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.colors.bg },
  container: {
    flexGrow: 1,
    padding: t.spacing[6],
    gap: t.spacing[6],
  },
  header: { gap: t.spacing[3], paddingTop: t.spacing[6] },
  checkboxes: { gap: t.spacing[5] },
  footer: {
    padding: t.spacing[6],
    paddingBottom: t.spacing[8],
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
    backgroundColor: t.colors.bg,
  },
});
