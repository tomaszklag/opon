'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';

type Step = 'firm' | 'confirm';

export interface FirmData {
  name: string;
  nip: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  description: string;
}

const EMPTY: FirmData = {
  name: '',
  nip: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
  voivodeship: '',
  description: '',
};

export const VOIVODESHIPS = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
];

export function useRegisterFlow() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState<Step>('firm');
  const [data, setData] = useState<FirmData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setField(field: keyof FirmData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function setNip(val: string) {
    setData((p) => ({ ...p, nip: val.replace(/\D/g, '').slice(0, 10) }));
  }

  function setPostalCode(val: string) {
    setData((p) => ({ ...p, postalCode: val.replace(/[^\d-]/g, '').slice(0, 6) }));
  }

  function handleFirmNext(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('confirm');
  }

  function goBack() {
    setStep('firm');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/providers', {
        name: data.name,
        nip: data.nip,
        phone: data.phone,
        email: data.email || undefined,
        address: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          voivodeship: data.voivodeship,
        },
        description: data.description || undefined,
      });
      await refresh();
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setError('Firma z tym NIPem już istnieje w systemie.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd rejestracji. Spróbuj ponownie.');
      }
      setStep('firm');
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    data,
    error,
    loading,
    setField,
    setNip,
    setPostalCode,
    handleFirmNext,
    handleSubmit,
    goBack,
  };
}
