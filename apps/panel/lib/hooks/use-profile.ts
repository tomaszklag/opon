'use client';
import useSWR from 'swr';
import { profileApi } from '../../api-data-access/profile';

export function useProfile() {
  const {
    data: profile,
    isLoading,
    mutate: revalidate,
  } = useSWR('provider-profile', profileApi.get);
  return { profile, isLoading, revalidate };
}

export function usePhotos() {
  const {
    data: photos = [],
    isLoading,
    mutate: revalidate,
  } = useSWR('provider-photos', profileApi.getPhotos);
  return { photos, isLoading, revalidate };
}
