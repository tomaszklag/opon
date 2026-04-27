'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOtp, verifyOtp, getMe } from '../../api-data-access/auth';
import { ApiError } from '../api';
import { useAuth } from '../auth';

type Step = 'phone' | 'otp';
type PhoneHint = 'none' | 'recognized' | 'not-registered';

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function useLoginFlow() {
  const router = useRouter();
  const { status, login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP resend countdown (300 s)
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Rate-limit countdown (600 s = 10 min)
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);

  // Extra phone-input states
  const [phoneHint, setPhoneHint] = useState<PhoneHint>('none');

  // CLIENT-role error (provider panel only accepts PROVIDER_OWNER / PROVIDER_STAFF)
  const [clientRoleError, setClientRoleError] = useState(false);

  const phone = '+48' + digits;
  const isRateLimited = rateLimitCountdown > 0;

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const t = setTimeout(() => setRateLimitCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [rateLimitCountdown]);

  function handleDigitsChange(val: string) {
    setDigits(val.replace(/\D/g, '').slice(0, 9));
    setError('');
    setPhoneHint('none');
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isRateLimited) return;
    if (digits.length !== 9) {
      setError('Podaj 9 cyfr numeru telefonu (bez +48)');
      return;
    }
    setError('');
    setPhoneHint('none');
    setLoading(true);
    try {
      await requestOtp({ phone });
      setStep('otp');
      setOtpCountdown(300);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setPhoneHint('not-registered');
      } else if (err instanceof ApiError && err.isTooManyRequests) {
        setRateLimitCountdown(600);
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd sieci. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setClientRoleError(false);
    setLoading(true);
    try {
      const res = await verifyOtp({ phone, code });
      const user = await getMe();

      if (user.role === 'CLIENT') {
        setClientRoleError(true);
        setCode('');
        return;
      }

      login(user);

      if (!res.providerId) {
        router.replace('/register');
      } else if (user.status !== 'APPROVED') {
        router.replace('/onboarding/weryfikacja');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError && err.isTooManyRequests) {
        // Too many wrong OTP attempts — back to phone step with rate limit
        setRateLimitCountdown(600);
        setStep('phone');
        setCode('');
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd weryfikacji.');
        setCode('');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (isRateLimited) return;
    setError('');
    setLoading(true);
    try {
      await requestOtp({ phone });
      setOtpCountdown(300);
    } catch (err) {
      if (err instanceof ApiError && err.isTooManyRequests) {
        setRateLimitCountdown(600);
        setStep('phone');
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd sieci.');
      }
    } finally {
      setLoading(false);
    }
  }

  function goToPhone() {
    setStep('phone');
    setCode('');
    setError('');
    setClientRoleError(false);
  }

  return {
    step,
    digits,
    code,
    error,
    loading,
    phone,
    phoneHint,
    otpCountdown,
    otpTimerLabel: formatCountdown(otpCountdown),
    rateLimitCountdown,
    rateLimitTimerLabel: formatCountdown(rateLimitCountdown),
    isRateLimited,
    clientRoleError,
    authLoading: status === 'loading',
    handleDigitsChange,
    handlePhoneSubmit,
    handleOtpSubmit,
    handleResend,
    setCode,
    goToPhone,
  };
}
