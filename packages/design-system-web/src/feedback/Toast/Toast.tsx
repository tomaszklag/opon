'use client';
import React from 'react';
import {
  Toaster as HotToaster,
  toast as hotToast,
  type ToasterProps,
  type ToastOptions,
} from 'react-hot-toast';

export interface ToasterDisplayProps extends ToasterProps {
  position?: ToasterProps['position'];
}

export function Toaster({ position = 'bottom-center', ...props }: ToasterDisplayProps) {
  return (
    <HotToaster
      position={position}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface-raised)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          boxShadow: 'var(--shadow-md)',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#2EE0A0', secondary: '#14171D' },
          style: { borderColor: 'var(--success-border)' },
        },
        error: {
          iconTheme: { primary: '#FF5757', secondary: '#14171D' },
          style: { borderColor: 'var(--danger-border)' },
        },
      }}
      {...props}
    />
  );
}

function success(message: string, opts?: ToastOptions) {
  return hotToast.success(message, opts);
}

function error(message: string, opts?: ToastOptions) {
  return hotToast.error(message, opts);
}

function info(message: string, opts?: ToastOptions) {
  return hotToast(message, {
    icon: 'ℹ️',
    style: { borderColor: 'var(--info-border)' },
    ...opts,
  });
}

export const toast = { success, error, info };
