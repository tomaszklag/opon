'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { api, ApiError } from '../api';

export type PhotoType = 'LOGO' | 'VEHICLE' | 'WORKSPACE' | 'ADDITIONAL';

export interface ProviderPhoto {
  id: string;
  url: string;
  type: PhotoType;
  isPrimary: boolean;
  size: number;
  mimeType: string;
  originalName: string;
}

const PHOTOS_KEY = '/v1/providers/me/photos';
const REQUIRED_TYPES: PhotoType[] = ['LOGO', 'VEHICLE', 'WORKSPACE'];

export function usePhotosFlow() {
  const {
    data: photos = [],
    error,
    isLoading,
    mutate,
  } = useSWR<ProviderPhoto[]>(PHOTOS_KEY, (path) => api.get<ProviderPhoto[]>(path), {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, type: PhotoType) => {
      setUploading(type === 'ADDITIONAL' ? 'additional' : type);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      try {
        const photo = await api.post<ProviderPhoto>(PHOTOS_KEY, formData);
        await mutate(
          (prev = []) => {
            // Single-slot types replace the existing entry optimistically
            const base = type !== 'ADDITIONAL' ? prev.filter((p) => p.type !== type) : prev;
            return [...base, photo];
          },
          { revalidate: false },
        );
      } catch (err) {
        setUploadError(err instanceof ApiError ? err.message : 'Błąd przesyłania zdjęcia.');
        await mutate();
      } finally {
        setUploading(null);
      }
    },
    [mutate],
  );

  const remove = useCallback(
    async (id: string) => {
      setUploadError(null);
      await mutate((prev = []) => prev.filter((p) => p.id !== id), { revalidate: false });
      try {
        await api.del(`${PHOTOS_KEY}/${id}`);
      } catch (err) {
        setUploadError(err instanceof ApiError ? err.message : 'Błąd usuwania zdjęcia.');
        await mutate();
      }
    },
    [mutate],
  );

  const setPrimary = useCallback(
    async (id: string) => {
      setUploadError(null);
      await mutate((prev = []) => prev.map((p) => ({ ...p, isPrimary: p.id === id })), {
        revalidate: false,
      });
      try {
        await api.patch(`${PHOTOS_KEY}/${id}/primary`);
      } catch (err) {
        setUploadError(err instanceof ApiError ? err.message : 'Błąd ustawiania zdjęcia głównego.');
        await mutate();
      }
    },
    [mutate],
  );

  const canProceed = REQUIRED_TYPES.every((type) => photos.some((p) => p.type === type));

  return {
    photos,
    isLoading,
    error:
      uploadError ??
      (error instanceof ApiError ? error.message : error ? 'Błąd pobierania zdjęć.' : null),
    uploading,
    upload,
    remove,
    setPrimary,
    canProceed,
  };
}
