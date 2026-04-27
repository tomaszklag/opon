'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';

export interface GusData {
  name: string;
  address: string;
  type: string;
  pkd: string;
  status: string;
}

export interface RegisterData {
  consentTerms: boolean;
  consentRodo: boolean;
  consentMarketing: boolean;
  nip: string;
  phone: string;
  email: string;
  iban: string;
}

const EMPTY: RegisterData = {
  consentTerms: false,
  consentRodo: false,
  consentMarketing: false,
  nip: '',
  phone: '',
  email: '',
  iban: '',
};

export function useRegisterFlow() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [data, setData] = useState<RegisterData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [gusData, setGusData] = useState<GusData | null>(null);
  const [gusLoading, setGusLoading] = useState(false);
  const [gusError, setGusError] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (data.nip.length !== 10) {
      setGusData(null);
      setGusError('');
      setGusLoading(false);
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setGusLoading(true);
    setGusData(null);
    setGusError('');

    api
      .get<GusData>(`/v1/gus/${data.nip}`, { signal: ctrl.signal })
      .then((res) => {
        setGusData(res);
        setGusLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setGusLoading(false);
        if (err instanceof ApiError && err.status === 404) {
          setGusError('NIP nie znaleziony w rejestrze GUS / CEIDG.');
        } else {
          setGusError('Błąd połączenia z GUS. Spróbuj ponownie.');
        }
      });

    return () => ctrl.abort();
  }, [data.nip]);

  function setNip(val: string) {
    setData((p) => ({ ...p, nip: val.replace(/\D/g, '').slice(0, 10) }));
  }

  function setPhone(val: string) {
    setData((p) => ({ ...p, phone: val.replace(/\D/g, '').slice(0, 9) }));
  }

  function setEmail(val: string) {
    setData((p) => ({ ...p, email: val }));
  }

  function setIban(val: string) {
    setData((p) => ({ ...p, iban: val.replace(/\D/g, '').slice(0, 26) }));
  }

  function toggleConsent(field: 'consentTerms' | 'consentRodo' | 'consentMarketing') {
    setData((p) => ({ ...p, [field]: !p[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!data.consentTerms || !data.consentRodo) {
      setError('Wymagane zgody (Regulamin i RODO) muszą być zaakceptowane.');
      return;
    }
    if (data.nip.length !== 10) {
      setError('Podaj poprawny NIP (10 cyfr).');
      return;
    }
    if (!gusData) {
      setError('Poczekaj na weryfikację NIP przez GUS lub popraw numer NIP.');
      return;
    }
    if (data.phone.length !== 9) {
      setError('Podaj 9 cyfr numeru telefonu (bez +48).');
      return;
    }
    if (!data.email) {
      setError('Podaj adres e-mail.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/v1/providers', {
        name: gusData.name,
        nip: data.nip,
        type: 'STATIONARY',
        phone: '+48' + data.phone,
        email: data.email,
      });
      await refresh();
      router.replace('/onboarding/weryfikacja');
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setError('Firma z tym NIPem już istnieje w systemie.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    error,
    loading,
    gusData,
    gusLoading,
    gusError,
    setNip,
    setPhone,
    setEmail,
    setIban,
    toggleConsent,
    handleSubmit,
  };
}
