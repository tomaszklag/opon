'use client';
import React, { useState, useMemo, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { FieldLabel } from '../FieldLabel/FieldLabel';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
}

interface PopupPos {
  top: number;
  left: number;
  width: number;
}

export function Combobox({
  label,
  value,
  onChange,
  options,
  placeholder = 'Wybierz…',
  required,
  error,
  hint,
  id,
  disabled,
}: ComboboxProps) {
  const uid = useId();
  const inputId = id ?? `combobox-${uid}`;
  const listId = `${inputId}-list`;

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [popupPos, setPopupPos] = useState<PopupPos | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function computePos(): PopupPos | null {
    if (!wrapperRef.current) return null;
    const rect = wrapperRef.current.getBoundingClientRect();
    return { top: rect.bottom + 4, left: rect.left, width: rect.width };
  }

  // Close on outside click — check both wrapper and portalled list
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setIsOpen(false);
      setQuery('');
      setActiveIndex(-1);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  // Update popup position on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    function update() {
      setPopupPos(computePos());
    }
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen]);

  // Scroll active option into view
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const list = listRef.current;
    const item = list?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  function open() {
    setQuery('');
    setActiveIndex(-1);
    setPopupPos(computePos());
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }

  function selectOption(opt: ComboboxOption) {
    if (opt.disabled) return;
    onChange(opt.value);
    close();
    inputRef.current?.blur();
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setActiveIndex(-1);
    if (!isOpen) setIsOpen(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) open();
        setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen) {
          const opt = activeIndex >= 0 ? filteredOptions[activeIndex] : filteredOptions[0];
          if (opt) selectOption(opt);
        }
        break;
      case 'Escape':
        e.preventDefault();
        close();
        break;
      case 'Tab':
        close();
        break;
    }
  }

  function handleToggle() {
    if (disabled) return;
    if (isOpen) {
      close();
    } else {
      open();
      inputRef.current?.focus();
    }
  }

  const activeOptionId = isOpen && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined;

  const listbox =
    isOpen && popupPos
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className={styles.listbox}
            style={{
              position: 'fixed',
              top: popupPos.top,
              left: popupPos.left,
              width: popupPos.width,
              zIndex: 9999,
            }}
          >
            {filteredOptions.length === 0 ? (
              <li className={styles.empty} aria-live="polite">
                Brak wyników
              </li>
            ) : (
              filteredOptions.map((opt, i) => (
                <li
                  key={opt.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={opt.value === value}
                  aria-disabled={opt.disabled}
                  className={[
                    styles.option,
                    i === activeIndex ? styles.optionActive : '',
                    opt.value === value ? styles.optionSelected : '',
                    opt.disabled ? styles.optionDisabled : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(opt);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {opt.label}
                  {opt.value === value && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.checkmark}
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>,
          document.querySelector('dialog[open]') ?? document.body,
        )
      : null;

  return (
    <div className={styles.wrapper}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required}>
          {label}
        </FieldLabel>
      )}
      <div className={`${styles.inputWrap} ${isOpen ? styles.open : ''}`} ref={wrapperRef}>
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-required={required}
          aria-invalid={error ? 'true' : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={isOpen ? 'Szukaj…' : selectedLabel || placeholder}
          value={isOpen ? query : selectedLabel}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isOpen) open();
          }}
          onKeyDown={handleKeyDown}
          className={`${styles.input} ${error ? styles.inputError : ''} ${!isOpen && value ? styles.inputFilled : ''}`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          onClick={handleToggle}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {listbox}
      </div>

      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
