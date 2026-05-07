'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProvider, updateProvider, type Provider } from '../../api-data-access/providers';
import { ApiError } from '../api';
import { providerSchema, type ProviderFormValues } from '../schemas/provider.schema';

function providerToValues(p: Provider): ProviderFormValues {
  return {
    name: p.name,
    description: p.description ?? '',
    phone: p.phone ?? '',
    email: p.email ?? '',
    logoUrl: p.logoUrl ?? '',
  };
}

export function useProviderForm() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: '', description: '', phone: '', email: '', logoUrl: '' },
  });

  const { reset } = form;

  useEffect(() => {
    getProvider()
      .then((p) => {
        setProvider(p);
        reset(providerToValues(p));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  async function onSubmit(data: ProviderFormValues) {
    setApiError(null);
    try {
      const updated = await updateProvider({
        name: data.name.trim(),
        description: data.description || undefined,
        phone: data.phone || undefined,
        logoUrl: data.logoUrl || undefined,
      });
      setProvider(updated);
      reset(providerToValues(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) setApiError(err.message);
    }
  }

  return {
    form,
    provider,
    loading,
    saved,
    apiError,
    onSubmit: form.handleSubmit(onSubmit),
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  };
}
