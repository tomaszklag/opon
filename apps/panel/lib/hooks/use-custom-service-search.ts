'use client';
import { useState, useEffect } from 'react';
import { bookingsApi, type CustomServiceSuggestion } from '../../api-data-access/bookings';

export function useCustomServiceSearch(query: string, debounceMs = 220) {
  const [suggestions, setSuggestions] = useState<CustomServiceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 1) {
      setSuggestions([]);
      return;
    }

    const id = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await bookingsApi.getCustomServiceSuggestions(clean);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(id);
  }, [query, debounceMs]);

  return { suggestions, isLoading };
}
