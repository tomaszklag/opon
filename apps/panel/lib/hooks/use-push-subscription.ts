'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from '../../api-data-access/push-subscriptions';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

function subToPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? '',
    auth: json.keys?.auth ?? '',
    userAgent: navigator.userAgent,
  };
}

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushSubscription() {
  const [permission, setPermission] = useState<PushPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PushPermission);
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!VAPID_PUBLIC_KEY) {
      console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY not set');
      return false;
    }
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await registerPushSubscription(subToPayload(existing));
        setPermission('granted');
        return true;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await registerPushSubscription(subToPayload(sub));
      setPermission('granted');
      return true;
    } catch {
      setPermission(Notification.permission as PushPermission);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await unregisterPushSubscription(subToPayload(sub));
        await sub.unsubscribe();
      }
      setPermission('default');
    } finally {
      setLoading(false);
    }
  }, []);

  return { permission, loading, subscribe, unsubscribe };
}
