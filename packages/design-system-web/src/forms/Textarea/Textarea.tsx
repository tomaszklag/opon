'use client';
import React, { useState } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  required,
  maxLength,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const [charCount, setCharCount] = useState(() => {
    if (value !== undefined) return String(value).length;
    if (defaultValue !== undefined) return String(defaultValue).length;
    return 0;
  });

  const textareaId =
    id ?? (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;
  const hintId = hint && textareaId ? `${textareaId}-hint` : undefined;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCharCount(e.target.value.length);
    onChange?.(e);
  }

  const controlled = value !== undefined;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <textarea
        id={textareaId}
        className={[styles.textarea, error ? styles.error : null, className]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        required={required}
        maxLength={maxLength}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        onChange={handleChange}
        {...props}
      />
      <div className={styles.footer}>
        <div>
          {hint && !error && (
            <p id={hintId} className={styles.hint}>
              {hint}
            </p>
          )}
          {error && (
            <p id={errorId} className={styles.errorMsg} role="alert">
              {error}
            </p>
          )}
        </div>
        {maxLength && (
          <span className={styles.counter}>
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
