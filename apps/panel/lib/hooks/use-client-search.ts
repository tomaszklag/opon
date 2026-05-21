'use client';
import { useState, useEffect } from 'react';
import { bookingsApi } from '../../api-data-access/bookings';

export interface ClientSuggestion {
  phone: string;
  name: string;
}

export function useClientSearch(query: string, debounceMs = 220) {
  const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const clean = query.replace(/\D/g, '');
    if (clean.length < 2 || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const id = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await bookingsApi.searchClients(query);
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
