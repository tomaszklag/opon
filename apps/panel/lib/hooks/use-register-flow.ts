'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { canonicalRoute } from '../auth-routing';
import { registerSchema, type RegisterFormValues } from '../schemas/register.schema';

export interface GusData {
  name: string;
  address: string;
  type: string;
  pkd: string;
  status: string;
}

export function useRegisterFlow() {
  const router = useRouter();
  const { refresh } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      consentTerms: false,
      consentRodo: false,
      consentMarketing: false,
      nip: '',
      phone: '',
      email: '',
    },
  });

  const [apiError, setApiError] = useState('');
  const [gusData, setGusData] = useState<GusData | null>(null);
  const [gusLoading, setGusLoading] = useState(false);
  const [gusError, setGusError] = useState('');
  const [gusErrorCode, setGusErrorCode] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const nip = form.watch('nip');

  useEffect(() => {
    if (nip.length !== 10) {
      setGusData(null);
      setGusError('');
      setGusErrorCode(null);
      setGusLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setGusLoading(true);
    setGusData(null);
    setGusError('');
    setGusErrorCode(null);

    api
      .get<GusData>(`/v1/gus/${nip}`, { signal: ctrl.signal })
      .then((res) => {
        setGusData(res);
        setGusLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setGusLoading(false);
        if (err instanceof ApiError) {
          switch (err.code) {
            case 'GUS_NIP_NOT_FOUND':
              setGusErrorCode('GUS_NIP_NOT_FOUND');
              setGusError('NIP nie znaleziony w rejestrze GUS / CEIDG.');
              break;
            case 'GUS_INVALID_NIP':
              setGusErrorCode('GUS_INVALID_NIP');
              setGusError('Nieprawidłowy numer NIP.');
              break;
            case 'GUS_CONNECTION_ERROR':
              setGusErrorCode('GUS_CONNECTION_ERROR');
              setGusError('CEIDG jest niedostępne. Spróbuj ponownie za chwilę.');
              break;
            case 'GUS_REQUEST_ERROR':
              setGusErrorCode('GUS_REQUEST_ERROR');
              setGusError('Błąd komunikacji z CEIDG — API może być w przerwie serwisowej.');
              break;
            default:
              setGusErrorCode(null);
              setGusError('Błąd połączenia z GUS. Spróbuj ponownie.');
          }
        } else {
          setGusErrorCode(null);
          setGusError('Błąd połączenia z GUS. Spróbuj ponownie.');
        }
      });

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nip, retryCount]);

  function toggleConsent(field: 'consentTerms' | 'consentRodo' | 'consentMarketing') {
    form.setValue(field, !form.getValues(field), {
      shouldValidate: true,
    });
  }

  async function onSubmit(values: RegisterFormValues) {
    setApiError('');
    if (!gusData) {
      setApiError('Poczekaj na weryfikację NIP przez GUS lub popraw numer NIP.');
      return;
    }
    try {
      await api.post('/v1/providers', {
        name: gusData.name,
        nip: values.nip,
        type: 'STATIONARY',
        phone: '+48' + values.phone,
        email: values.email,
      });
      const freshUser = await refresh();
      router.replace(canonicalRoute(freshUser));
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'PROVIDER_ALREADY_EXISTS' || err.isConflict)) {
        setApiError('Firma z tym NIPem już istnieje w systemie.');
      } else {
        setApiError(err instanceof ApiError ? err.message : 'Błąd rejestracji. Spróbuj ponownie.');
      }
    }
  }

  return {
    form,
    apiError,
    gusData,
    gusLoading,
    gusError,
    gusErrorCode,
    retry: () => setRetryCount((c) => c + 1),
    toggleConsent,
    handleSubmit: form.handleSubmit(onSubmit),
  };
}
