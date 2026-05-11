'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select, Textarea, Toggle, Text } from '@opony/design-system-web';
import type { TireSetDetail, CreateTireSetBody, TireType } from '../../../../api-data-access/depot';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (body: CreateTireSetBody) => Promise<void>;
  initial?: Partial<{
    clientName: string;
    clientPhone: string;
    tireSize: string;
    sourceBookingId: string;
  }>;
  editValues?: TireSetDetail | null;
}

const TIRE_TYPE_OPTIONS = [
  { label: 'Zimowe', value: 'WINTER' },
  { label: 'Letnie', value: 'SUMMER' },
  { label: 'Całoroczne', value: 'ALL_SEASON' },
];

const today = () => new Date().toISOString().slice(0, 10);
const in6months = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().slice(0, 10);
};

export function TireSetModal({ isOpen, onClose, onSubmit, initial, editValues }: Props) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [tireSize, setTireSize] = useState('');
  const [tireType, setTireType] = useState<TireType>('WINTER');
  const [isOnRims, setIsOnRims] = useState(true);
  const [storedAt, setStoredAt] = useState(today());
  const [releaseDue, setReleaseDue] = useState(in6months());
  const [pricePln, setPricePln] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editValues) {
      setClientName(editValues.clientName);
      setClientPhone(editValues.clientPhone);
      setVehicleName(editValues.vehicleName ?? '');
      setLicensePlate(editValues.licensePlate ?? '');
      setBrand(editValues.brand ?? '');
      setModel(editValues.model ?? '');
      setTireSize(editValues.tireSize);
      setTireType(editValues.tireType as TireType);
      setIsOnRims(editValues.isOnRims);
      setPricePln(editValues.storagePricePln != null ? String(editValues.storagePricePln) : '');
      setNotes(editValues.notes ?? '');
    } else {
      setClientName(initial?.clientName ?? '');
      setClientPhone(initial?.clientPhone ?? '');
      setVehicleName('');
      setLicensePlate('');
      setBrand('');
      setModel('');
      setTireSize(initial?.tireSize ?? '');
      setTireType('WINTER');
      setIsOnRims(true);
      setStoredAt(today());
      setReleaseDue(in6months());
      setPricePln('');
      setNotes('');
    }
    setError(null);
  }, [isOpen, editValues, initial]);

  async function handleSubmit() {
    if (!clientName.trim() || !clientPhone.trim() || !tireSize.trim()) {
      setError('Wypełnij imię klienta, telefon i rozmiar opon.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        vehicleName: vehicleName.trim() || undefined,
        licensePlate: licensePlate.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        tireSize: tireSize.trim(),
        tireType,
        isOnRims,
        storedAt: editValues ? undefined : storedAt,
        releaseDue: editValues ? undefined : releaseDue || undefined,
        storagePricePln: pricePln ? parseFloat(pricePln) : undefined,
        notes: notes.trim() || undefined,
        sourceBookingId: initial?.sourceBookingId,
      });
      onClose();
    } catch {
      setError('Błąd zapisu. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  const title = editValues ? 'Edytuj zestaw opon' : 'Dodaj zestaw do składu';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Anuluj
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Zapisywanie…' : editValues ? 'Zapisz zmiany' : 'Dodaj do składu'}
          </Button>
        </>
      }
    >
      {error && (
        <Text variant="nano" as="p" color="danger" style={{ marginBottom: 12 }}>
          {error}
        </Text>
      )}

      <Text variant="kicker" as="p" weight="bold" style={{ marginBottom: 8 }}>
        Klient
      </Text>
      <Input
        label="Imię i nazwisko"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Input
        label="Telefon"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <Text variant="kicker" as="p" weight="bold" style={{ marginBottom: 8 }}>
        Pojazd
      </Text>
      <Input
        label="Nazwa pojazdu (opcjonalnie)"
        value={vehicleName}
        onChange={(e) => setVehicleName(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Input
        label="Nr rejestracyjny (opcjonalnie)"
        value={licensePlate}
        onChange={(e) => setLicensePlate(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <Text variant="kicker" as="p" weight="bold" style={{ marginBottom: 8 }}>
        Opony
      </Text>
      <Input
        label="Rozmiar (np. 205/55R16)"
        value={tireSize}
        onChange={(e) => setTireSize(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Input
          label="Marka (opcjonalnie)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <Input
          label="Model (opcjonalnie)"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <Select
        label="Typ"
        options={TIRE_TYPE_OPTIONS}
        value={tireType}
        onChange={(e) => setTireType(e.target.value as TireType)}
        style={{ marginBottom: 10 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Toggle
          checked={isOnRims}
          onChange={(e) => setIsOnRims(e.target.checked)}
          label="Na felgach"
        />
      </div>

      {!editValues && (
        <>
          <Text variant="kicker" as="p" weight="bold" style={{ marginBottom: 8 }}>
            Okres składowania
          </Text>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
          >
            <Input
              label="Data przyjęcia"
              type="date"
              value={storedAt}
              onChange={(e) => setStoredAt(e.target.value)}
            />
            <Input
              label="Termin wydania (opcjonalnie)"
              type="date"
              value={releaseDue}
              onChange={(e) => setReleaseDue(e.target.value)}
            />
          </div>
        </>
      )}

      <Text variant="kicker" as="p" weight="bold" style={{ marginBottom: 8 }}>
        Dodatkowe
      </Text>
      <Input
        label="Cena składowania (zł, opcjonalnie)"
        type="number"
        value={pricePln}
        onChange={(e) => setPricePln(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Textarea
        label="Uwagi (opcjonalnie)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
      />
    </Modal>
  );
}
