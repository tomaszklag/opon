'use client';
import React, { useState, useCallback } from 'react';
import {
  Modal,
  Button,
  Input,
  PhoneInput,
  Select,
  Textarea,
  Toggle,
  Text,
  Spinner,
} from '@opony/design-system-web';
import { useCreateManualBooking } from '../../../lib/hooks/use-create-manual-booking';
import { useProvider } from '../../../lib/hooks/use-provider';
import { useWorkersList } from '../../../lib/hooks/use-workers-list';
import { useAvailability } from '../../../lib/hooks/use-availability';
import type { AvailabilitySlot } from '../../../api-data-access/bookings';
import styles from './ManualBookingModal.module.css';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const SERVICE_TYPE_OPTIONS = [
  { value: '', label: 'Wybierz usługę…' },
  { value: 'SEASONAL_SWAP', label: 'Wymiana sezonowa' },
  { value: 'WHEEL_SWAP', label: 'Wymiana kół' },
  { value: 'BALANCING', label: 'Wyważanie' },
  { value: 'PUNCTURE_REPAIR', label: 'Naprawa przebitej opony' },
];

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function pluralConflicts(n: number): string {
  if (n === 1) return 'rezerwację';
  if (n >= 2 && n <= 4) return 'rezerwacje';
  return 'rezerwacji';
}

export function ManualBookingModal({ isOpen, onClose, onSuccess }: ManualBookingModalProps) {
  const { createBooking, isLoading, error } = useCreateManualBooking();
  const { provider } = useProvider();
  const { workers } = useWorkersList();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [tireSize, setTireSize] = useState('');
  const [customTireSize, setCustomTireSize] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [totalPricePln, setTotalPricePln] = useState('');
  const [notes, setNotes] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { availability, isLoading: availLoading } = useAvailability(date, workerId || undefined);

  const tireSizeOptions = [
    { value: '', label: 'Wybierz rozmiar…' },
    ...(provider?.tireSizes ?? []).map((s) => ({ value: s, label: s })),
    { value: '__custom__', label: 'Inna…' },
  ];

  const workerOptions = [
    { value: '', label: 'Dowolny pracownik' },
    ...workers.map((w) => ({ value: w.id, label: w.name })),
  ];

  const resetForm = useCallback(() => {
    setClientName('');
    setClientPhone('');
    setServiceType('');
    setTireSize('');
    setCustomTireSize('');
    setWorkerId('');
    setDate(getDefaultDate());
    setSelectedSlot(null);
    setTotalPricePln('');
    setNotes('');
    setAutoConfirm(true);
    setValidationError(null);
  }, []);

  function handleDateChange(newDate: string) {
    setDate(newDate);
    setSelectedSlot(null);
  }

  function handleWorkerChange(newWorkerId: string) {
    setWorkerId(newWorkerId);
    setSelectedSlot(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      setValidationError('Wypełnij wszystkie wymagane pola.');
      return;
    }
    if (!selectedSlot) {
      setValidationError('Wybierz slot czasowy.');
      return;
    }

    setValidationError(null);

    const resolvedTireSize =
      tireSize === '__custom__' ? customTireSize.trim() || undefined : tireSize || undefined;

    const ok = await createBooking({
      clientName: clientName.trim(),
      clientPhone: `+48${clientPhone.trim()}`,
      startAt: selectedSlot.startAt,
      endAt: selectedSlot.endAt,
      tireSize: resolvedTireSize,
      serviceType: serviceType || undefined,
      workerId: workerId || undefined,
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

        {/* Sekcja: Usługa */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Usługa
          </Text>
          <div className={[styles.row, styles.row2].join(' ')}>
            <Select
              label="Rodzaj usługi"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              options={SERVICE_TYPE_OPTIONS}
            />
            <Select
              label="Rozmiar opon"
              value={tireSize}
              onChange={(e) => setTireSize(e.target.value)}
              options={tireSizeOptions}
            />
          </div>
          {tireSize === '__custom__' && (
            <Input
              label="Podaj rozmiar opon"
              value={customTireSize}
              onChange={(e) => setCustomTireSize(e.target.value)}
              placeholder="205/55 R16"
            />
          )}
        </div>

        {/* Sekcja: Termin */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Termin
          </Text>
          <div className={[styles.row, styles.row2].join(' ')}>
            <Input
              label="Data"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
            <Select
              label="Pracownik"
              value={workerId}
              onChange={(e) => handleWorkerChange(e.target.value)}
              options={workerOptions}
            />
          </div>

          {/* Slot picker */}
          <div className={styles.slotSection}>
            {availLoading && (
              <div className={styles.spinnerRow}>
                <Spinner size="md" />
              </div>
            )}
            {!availLoading && availability?.isClosedDay && (
              <div className={styles.closedDayMsg}>
                <Text variant="body-sm" color="muted" as="p">
                  Warsztat nieczynny tego dnia
                </Text>
              </div>
            )}
            {!availLoading && availability && !availability.isClosedDay && (
              <div className={styles.slotGrid}>
                {availability.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.startAt === slot.startAt && selectedSlot?.endAt === slot.endAt;
                  const hasConflict = !slot.isAvailable || slot.conflictCount > 0;
                  return (
                    <Button
                      key={slot.startAt}
                      type="button"
                      variant={isSelected ? 'primary' : 'neutral'}
                      size="sm"
                      className={styles.slotBtn}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatSlotTime(slot.startAt)}
                      {' – '}
                      {formatSlotTime(slot.endAt)}
                      {hasConflict && <span className={styles.slotConflict} />}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Conflict warning */}
          {selectedSlot && (!selectedSlot.isAvailable || selectedSlot.conflictCount > 0) && (
            <div className={styles.conflictBanner}>
              <Text variant="body-sm" color="warning" as="p">
                Ten slot ma {selectedSlot.conflictCount}{' '}
                {pluralConflicts(selectedSlot.conflictCount)} — zapis możliwy, ale może być
                konflikt.
              </Text>
            </div>
          )}
        </div>

        {/* Sekcja: Szczegóły */}
        <div className={styles.formSection}>
          <Text variant="kicker-sm" color="muted">
            Szczegóły
          </Text>
          <Input
            label="Cena (zł)"
            type="number"
            value={totalPricePln}
            onChange={(e) => setTotalPricePln(e.target.value)}
            min={0}
          />
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
