'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { type AuthUser, useAuth } from '../../lib/auth';
import styles from './login.module.css';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { status, login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  // Countdown timer after OTP sent
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/auth/request-otp', { phone });
      setStep('otp');
      setCountdown(300);
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd sieci. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<AuthUser & { role: string }>('/v1/auth/verify-otp', {
        phone,
        code,
      });
      // Fetch full user profile (has jti etc.)
      const user = await api.get<AuthUser>('/v1/auth/me');
      login(user);
      router.replace(res.providerId ? '/dashboard' : '/register');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd weryfikacji.');
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/auth/request-otp', { phone });
      setCountdown(300);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd sieci.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>opony.app</div>
        <h1 className={styles.title}>
          {step === 'phone' ? 'Zaloguj się do panelu' : 'Wpisz kod SMS'}
        </h1>
        <p className={styles.subtitle}>
          {step === 'phone' ? 'Wyślemy jednorazowy kod na Twój numer' : `Kod wysłany na ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="phone" className={styles.label}>
                Numer telefonu
              </label>
              <input
                id="phone"
                type="tel"
                className={styles.input}
                placeholder="+48600000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                autoFocus
                required
                pattern="^\+48\d{9}$"
                title="Format: +48 i 9 cyfr"
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? 'Wysyłanie…' : 'Wyślij kod SMS'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="otp" className={styles.label}>
                Kod weryfikacyjny (6 cyfr)
              </label>
              <input
                id="otp"
                ref={otpRef}
                type="text"
                inputMode="numeric"
                className={`${styles.input} ${styles.inputOtp}`}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                autoComplete="one-time-code"
                maxLength={6}
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.btn} disabled={loading || code.length !== 6}>
              {loading ? 'Weryfikacja…' : 'Zaloguj się'}
            </button>

            <div className={styles.resendRow}>
              {countdown > 0 ? (
                <span className={styles.countdown}>
                  Możesz wysłać ponownie za {Math.floor(countdown / 60)}:
                  {String(countdown % 60).padStart(2, '0')}
                </span>
              ) : (
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={handleResend}
                  disabled={loading}
                >
                  Wyślij kod ponownie
                </button>
              )}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => {
                  setStep('phone');
                  setCode('');
                  setError('');
                }}
              >
                Zmień numer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
