'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '../auth';
import { routeBookingEvent } from './booking-event-router';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const SSE_URL = `${API_URL}/v1/providers/me/realtime/events`;

const RealtimeContext = createContext<null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const esRef = useRef<EventSource | null>(null);

  function connect() {
    if (esRef.current) return;
    const es = new EventSource(SSE_URL, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data as string) as {
          type: string;
          payload: unknown;
          ts: string;
        };
        if (event.type !== 'ping') {
          routeBookingEvent(event as Parameters<typeof routeBookingEvent>[0]);
        }
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      // reconnect after 5s
      setTimeout(connect, 5000);
    };
  }

  function disconnect() {
    esRef.current?.close();
    esRef.current = null;
  }

  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!esRef.current || esRef.current.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status]);

  return <RealtimeContext.Provider value={null}>{children}</RealtimeContext.Provider>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useRealtime() {
  return useContext(RealtimeContext);
}
