'use client';
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Input,
  PhoneInput,
  Select,
  Textarea,
  Toggle,
  Text,
} from '@opony/design-system-web';
import { useCreateManualBooking } from '../../../lib/hooks/use-create-manual-booking';
import styles from './ManualBookingModal.module.css';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultStartTime(): string {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now.toTimeString().slice(0, 5);
}

const DURATION_OPTIONS = [
  { value: '30', label: '30 minut' },
  { value: '45', label: '45 minut' },
  { value: '60', label: '60 minut' },
  { value: '90', label: '90 minut' },
  { value: '120', label: '2 godziny' },
  { value: '180', label: '3 godziny' },
];

export function ManualBookingModal({ isOpen, onClose, onSuccess }: ManualBookingModalProps) {
  const { createBooking, isLoading, error } = useCreateManualBooking();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [startTime, setStartTime] = useState(getDefaultStartTime);
  const [duration, setDuration] = useState(60);
  const [tireSize, setTireSize] = useState('');
  const [totalPricePln, setTotalPricePln] = useState('');
  const [notes, setNotes] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  function resetForm() {
    setClientName('');
    setClientPhone('');
    setDate(getDefaultDate());
    setStartTime(getDefaultStartTime());
    setDuration(60);
    setTireSize('');
    setTotalPricePln('');
    setNotes('');
    setAutoConfirm(true);
    setValidationError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim() || !date || !startTime) {
      setValidationError('Wypełnij wszystkie wymagane pola.');
      return;
    }

    setValidationError(null);

    const startAt = new Date(`${date}T${startTime}`).toISOString();
    const endAt = new Date(new Date(startAt).getTime() + duration * 60000).toISOString();

    const ok = await createBooking({
      clientName: clientName.trim(),
      clientPhone: `+48${clientPhone.trim()}`,
      startAt,
      endAt,
      tireSize: tireSize.trim() || undefined,
      totalPricePln: totalPricePln ? Number(totalPricePln) : undefined,
      notes: notes.trim() || undefined,
      autoConfirm,
    });

    if (ok) {
      onSuccess?.();
      onClose();
      resetForm();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wizyta ręczna"
      size="lg"
      footer={
        <>
          <Button variant="neutral" size="md" onClick={onClose} type="button">
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="manual-booking-form"
            loading={isLoading}
          >
            {autoConfirm ? 'Utwórz i potwierdź' : 'Utwórz jako oczekującą'}
          </Button>
        </>
      }
    >
      <form id="manual-booking-form" onSubmit={handleSubmit} className={styles.form}>
        {/* Sekcja: Klient */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Klient
          </Text>
          <div className={[styles.row, styles.row2].join(' ')}>
            <Input
              label="Imię i nazwisko"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              autoComplete="off"
            />
            <PhoneInput
              label="Telefon"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Sekcja: Termin */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Termin
          </Text>
          <div className={[styles.row, styles.row3].join(' ')}>
            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="Godzina rozpoczęcia"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Select
              label="Czas trwania"
              value={String(duration)}
              onChange={(e) => setDuration(Number(e.target.value))}
              options={DURATION_OPTIONS}
            />
          </div>
        </div>

        {/* Sekcja: Szczegóły */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Szczegóły
          </Text>
          <div className={[styles.row, styles.row2].join(' ')}>
            <Input
              label="Rozmiar opon"
              value={tireSize}
              onChange={(e) => setTireSize(e.target.value)}
              placeholder="205/55 R16"
            />
            <Input
              label="Cena (zł)"
              type="number"
              value={totalPricePln}
              onChange={(e) => setTotalPricePln(e.target.value)}
              min={0}
            />
          </div>
          <Textarea
            label="Notatki"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className={styles.toggleRow}>
            <Toggle
              label="Potwierdź automatycznie"
              checked={autoConfirm}
              onChange={(e) => setAutoConfirm(e.target.checked)}
            />
          </div>
        </div>

        {/* Błędy */}
        {validationError && (
          <Text variant="body-sm" color="danger" as="p" className={styles.errorMsg}>
            {validationError}
          </Text>
        )}
        {error && (
          <Text variant="body-sm" color="danger" as="p" className={styles.errorMsg}>
            {error}
          </Text>
        )}
      </form>
    </Modal>
  );
}
