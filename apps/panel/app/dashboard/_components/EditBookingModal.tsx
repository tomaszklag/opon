'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Button, FieldLabel, Input, Textarea, Text } from '@opony/design-system-web';
import { bookingsApi } from '../../../api-data-access/bookings';
import { IconXClose } from '../../../components/icons';
import styles from './EditBookingModal.module.css';

interface SubServiceRow {
  name: string;
  price: string; // empty string = included in price (pricePln: null)
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  referenceCode: string;
  initialTotalPricePln: number | null;
  initialSubServices: { name: string; pricePln: number | null }[];
  initialClientNote: string | null;
}

export function EditBookingModal({
  isOpen,
  onClose,
  onSuccess,
  referenceCode,
  initialTotalPricePln,
  initialSubServices,
  initialClientNote,
}: Props) {
  const [totalPrice, setTotalPrice] = useState('');
  const [subServices, setSubServices] = useState<SubServiceRow[]>([]);
  const [clientNote, setClientNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTotalPrice(initialTotalPricePln != null ? String(initialTotalPricePln) : '');
    setSubServices(
      initialSubServices.map((s) => ({
        name: s.name,
        price: s.pricePln != null ? String(s.pricePln) : '',
      })),
    );
    setClientNote(initialClientNote ?? '');
    setError(null);
  }, [isOpen, initialTotalPricePln, initialSubServices, initialClientNote]);

  function updateRow(i: number, field: keyof SubServiceRow, value: string) {
    setSubServices((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );
  }

  function addRow() {
    setSubServices((prev) => [...prev, { name: '', price: '' }]);
  }

  function removeRow(i: number) {
    setSubServices((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const parsedTotal =
        totalPrice.trim() !== '' ? parseFloat(totalPrice.replace(',', '.')) : null;
      const parsedSubs = subServices
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          pricePln: s.price.trim() !== '' ? parseFloat(s.price.replace(',', '.')) : null,
        }));

      await bookingsApi.editBooking(referenceCode, {
        totalPricePln: parsedTotal,
        subServices: parsedSubs,
        clientNote: clientNote.trim() || null,
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zapisać zmian.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edytuj wizytę"
      size="md"
      footer={
        <>
          <Button variant="neutral" size="md" onClick={onClose} disabled={saving}>
            Anuluj
          </Button>
          <Button variant="primary" size="md" onClick={() => void handleSave()} loading={saving}>
            Zapisz zmiany
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        {/* ── Cena łączna ── */}
        <div className={styles.field}>
          <FieldLabel>Cena łączna (zł)</FieldLabel>
          <div className={styles.priceInputRow}>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="0,00"
            />
            <Text variant="body-sm" as="span" color="muted">
              zł
            </Text>
          </div>
        </div>

        {/* ── Podusługi ── */}
        <div className={styles.field}>
          <div className={styles.subServicesHead}>
            <FieldLabel>Podusługi</FieldLabel>
            <Button variant="ghost" size="sm" onClick={addRow}>
              + Dodaj pozycję
            </Button>
          </div>
          {subServices.length === 0 ? (
            <Text variant="body-sm" as="p" color="muted" className={styles.emptyHint}>
              Brak podusług — kliknij „+ Dodaj pozycję&rdquo; aby dodać.
            </Text>
          ) : (
            <div className={styles.subServicesList}>
              {subServices.map((row, i) => (
                <div key={i} className={styles.subServiceRow}>
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(i, 'name', e.target.value)}
                    placeholder="Nazwa usługi"
                  />
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.price}
                    onChange={(e) => updateRow(i, 'price', e.target.value)}
                    placeholder="w cenie"
                    className={styles.priceInput}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeRow(i)}
                    aria-label="Usuń pozycję"
                  >
                    <IconXClose width="11" height="11" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Notatka dla klienta ── */}
        <div className={styles.field}>
          <FieldLabel>Notatka dla klienta</FieldLabel>
          <Textarea
            value={clientNote}
            onChange={(e) => setClientNote(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Widoczna dla klienta np. w potwierdzeniu wizyty…"
          />
        </div>

        {error && (
          <Text variant="body-sm" as="p" color="danger">
            {error}
          </Text>
        )}
      </div>
    </Modal>
  );
}
