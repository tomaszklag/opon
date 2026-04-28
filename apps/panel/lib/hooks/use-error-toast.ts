'use client';

import { useCallback } from 'react';
import { toast } from '@opony/design-system-web';
import { ApiError } from '../api';

/**
 * Zwraca funkcję `showError`, która wyświetla toast z komunikatem błędu.
 *
 * Kolejność priorytetów:
 *  1. Jeśli to ApiError z polem `code` — szuka wiadomości w `codeMessages`
 *  2. Jeśli to ApiError — używa `err.message` z backendu
 *  3. Fallback — `defaultMessage`
 */
export function useErrorToast() {
  const showError = useCallback(
    (
      err: unknown,
      options: {
        codeMessages?: Partial<Record<string, string>>;
        defaultMessage?: string;
      } = {},
    ) => {
      const { codeMessages, defaultMessage = 'Wystąpił błąd. Spróbuj ponownie.' } = options;

      if (err instanceof ApiError) {
        if (err.code && codeMessages?.[err.code]) {
          toast.error(codeMessages[err.code]!);
          return;
        }
        toast.error(err.message);
        return;
      }

      toast.error(defaultMessage);
    },
    [],
  );

  return { showError };
}
