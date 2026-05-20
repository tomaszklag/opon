import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t, Heading, Text, Button, OtpInput, useToast } from '@opony/design-system-native';
import { verifyOtp, requestOtp } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { ApiError } from '@/lib/error';

const RESEND_SECONDS = 60;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const router = useRouter();
  const { show } = useToast();
  const { login, setPendingOnboarding } = useAuthStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [hasError, setHasError] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current!);
  }, []);

  const handleVerify = async (value: string) => {
    if (value.length !== 6) return;
    setLoading(true);
    setHasError(false);
    try {
      const res = await verifyOtp({ phone, code: value });
      login(res.user, res.accessToken, res.refreshToken);

      if (res.requiresConsent) {
        setPendingOnboarding(res.isNewUser);
        router.replace('/(auth)/consent' as never);
      } else if (res.isNewUser) {
        setPendingOnboarding(true);
        router.replace('/(app)/onboarding/profile' as never);
      } else {
        router.replace('/(app)/' as never);
      }
    } catch (err) {
      setHasError(true);
      setCode('');
      const msg =
        err instanceof ApiError && err.isNotFound()
          ? 'Nieprawidłowy kod. Spróbuj ponownie.'
          : err instanceof ApiError
            ? err.getMessage()
            : 'Błąd weryfikacji kodu.';
      show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOtp({ phone });
      setCountdown(RESEND_SECONDS);
      setCode('');
      setHasError(false);
      clearInterval(timer.current!);
      timer.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      show('Kod wysłany ponownie', 'success');
    } catch {
      show('Nie udało się wysłać kodu.', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleChange = (value: string) => {
    if (loading) return;
    setCode(value);
    if (value.length === 6) handleVerify(value);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Heading variant="h1">Wpisz kod</Heading>
          <Text variant="body" color="textSecondary">
            Wysłaliśmy 6-cyfrowy kod na numer{' '}
            <Text variant="body" color="textPrimary" weight="semibold">
              {phone}
            </Text>
          </Text>
        </View>

        <View style={styles.otpWrap}>
          <OtpInput value={code} onChange={handleChange} error={hasError} autoFocus />
          {hasError ? (
            <Text variant="caption" color="danger" align="center">
              Nieprawidłowy kod. Sprawdź SMS i spróbuj ponownie.
            </Text>
          ) : null}
        </View>

        {loading ? (
          <Text variant="body" color="textMuted" align="center">
            Weryfikacja…
          </Text>
        ) : null}

        <View style={styles.resend}>
          {countdown > 0 ? (
            <Text variant="bodySmall" color="textMuted" align="center">
              Wyślij ponownie za {countdown} s
            </Text>
          ) : (
            <Button variant="ghost" size="sm" loading={resending} onPress={handleResend}>
              Wyślij kod ponownie
            </Button>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: t.colors.bg },
  container: {
    flex: 1,
    padding: t.spacing[6],
    justifyContent: 'center',
    gap: t.spacing[8],
  },
  header: { gap: t.spacing[3] },
  otpWrap: { gap: t.spacing[3] },
  resend: { alignItems: 'center' },
});
