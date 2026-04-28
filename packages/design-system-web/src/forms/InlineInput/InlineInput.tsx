'use client';
import React from 'react';
import styles from './InlineInput.module.css';

export type InlineInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  function InlineInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={[styles.inlineInput as string, className].filter(Boolean).join(' ')}
        {...props}
      />
    );
  },
);

InlineInput.displayName = 'InlineInput';
