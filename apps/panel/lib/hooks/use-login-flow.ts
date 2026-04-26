'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOtp, verifyOtp, getMe } from '../../api-data-access/auth';
import { ApiError } from '../api';
import { useAuth } from '../auth';

type Step = 'phone' | 'otp';

export function useLoginFlow() {
  const router = useRouter();
  const { status, login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const phone = '+48' + digits;
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timerLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleDigitsChange(val: string) {
    setDigits(val.replace(/\D/g, '').slice(0, 9));
    setError('');
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (digits.length !== 9) {
      setError('Podaj 9 cyfr numeru telefonu (bez +48)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOtp({ phone });
      setStep('otp');
      setCountdown(300);
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
      const res = await verifyOtp({ phone, code });
      const user = await getMe();
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
      await requestOtp({ phone });
      setCountdown(300);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd sieci.');
    } finally {
      setLoading(false);
    }
  }

  function goToPhone() {
    setStep('phone');
    setCode('');
    setError('');
  }

  return {
    step,
    digits,
    code,
    error,
    loading,
    countdown,
    phone,
    timerLabel,
    authLoading: status === 'loading',
    handleDigitsChange,
    handlePhoneSubmit,
    handleOtpSubmit,
    handleResend,
    setCode,
    goToPhone,
  };
}
