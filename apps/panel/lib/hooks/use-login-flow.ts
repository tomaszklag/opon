'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [cells, setCells] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone = '+48' + digits;
  const code = cells.join('');
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
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
      setCells(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
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

  function handleCellChange(idx: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...cells];
    next[idx] = digit;
    setCells(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  }

  function handleCellKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !cells[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }

  function handleCellPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = Array(6).fill('') as string[];
    for (let i = 0; i < text.length; i++) next[i] = text[i] ?? '';
    setCells(next);
    otpRefs.current[Math.min(text.length, 5)]?.focus();
  }

  function goToPhone() {
    setStep('phone');
    setCells(['', '', '', '', '', '']);
    setError('');
  }

  return {
    step,
    digits,
    cells,
    error,
    loading,
    countdown,
    otpRefs,
    phone,
    code,
    timerLabel,
    authLoading: status === 'loading',
    handleDigitsChange,
    handlePhoneSubmit,
    handleOtpSubmit,
    handleResend,
    handleCellChange,
    handleCellKeyDown,
    handleCellPaste,
    goToPhone,
  };
}
