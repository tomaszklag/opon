'use client';

import { useState } from 'react';
import { Button, Heading, Text, Spinner } from '@opony/design-system-web';
import type { TireSetDetail as TireSetDetailType } from '../../../../api-data-access/depot';
import { PickupModal } from './PickupModal';
import styles from '../depot.module.css';

interface Props {
  detail: TireSetDetailType | null;
  loading: boolean;
  onPickup: (id: string) => Promise<void>;
  onEdit: (detail: TireSetDetailType) => void;
  onClose: () => void;
}

const TIRE_TYPE_LABEL: Record<string, string> = {
  SUMMER: 'Letnie',
  WINTER: 'Zimowe',
  ALL_SEASON: 'Całoroczne',
};

const CONDITION_LABEL: Record<string, string> = {
  GOOD: 'Dobry',
  WORN: 'Zużyte',
  CRITICAL: 'Krytyczny',
};

export function TireSetDetailPanel({ detail, loading, onPickup, onEdit, onClose }: Props) {
  const [showPickup, setShowPickup] = useState(false);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spinner size="md" label="Ładowanie…" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <>
      <PickupModal
        isOpen={showPickup}
        clientName={detail.clientName}
        onConfirm={() => onPickup(detail.id)}
        onClose={() => setShowPickup(false)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <Heading variant="subsection" as="h2">
              {detail.clientName}
            </Heading>
            <Text variant="body-sm" as="p" color="secondary">
              {detail.clientPhone}
            </Text>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <span
          className={`${styles.statusChip} ${detail.status === 'IN_DEPOT' ? styles.statusInDepot : styles.statusPickedUp}`}
        >
          <Text
            variant="nano"
            as="span"
            weight="bold"
            mono
            color={detail.status === 'IN_DEPOT' ? 'accent' : 'secondary'}
          >
            {detail.status === 'IN_DEPOT' ? 'W składzie' : 'Wydany'}
          </Text>
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <DataItem label="Pojazd" value={detail.vehicleName ?? '—'} />
          <DataItem label="Nr rej." value={detail.licensePlate ?? '—'} />
          <DataItem label="Rozmiar" value={detail.tireSize} />
          <DataItem label="Typ" value={TIRE_TYPE_LABEL[detail.tireType] ?? detail.tireType} />
          <DataItem
            label="Marka/Model"
            value={[detail.brand, detail.model].filter(Boolean).join(' ') || '—'}
          />
          <DataItem label="Na felgach" value={detail.isOnRims ? 'Tak' : 'Nie'} />
          <DataItem label="Stan" value={CONDITION_LABEL[detail.condition] ?? detail.condition} />
          <DataItem label="Lokalizacja" value={detail.slotLabel ?? '—'} />
          {detail.storagePricePln != null && (
            <DataItem label="Cena" value={`${detail.storagePricePln} zł`} />
          )}
        </div>

        {detail.notes && (
          <div>
            <Text variant="nano" as="p" color="secondary" weight="bold">
              Uwagi
            </Text>
            <Text variant="body-sm" as="p">
              {detail.notes}
            </Text>
          </div>
        )}

        <div>
          <Text variant="nano" as="p" color="secondary" weight="bold" style={{ marginBottom: 8 }}>
            Historia sezonów
          </Text>
          {detail.periods.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--border)',
                marginBottom: 6,
                background: p.pickedUpAt ? 'var(--bg)' : 'var(--accent-muted)',
              }}
            >
              <Text variant="nano" as="p" weight="bold">
                {new Date(p.storedAt).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                {p.pickedUpAt
                  ? ` → ${new Date(p.pickedUpAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : ' → teraz'}
              </Text>
              {p.releaseDue && !p.pickedUpAt && (
                <Text variant="nano" as="p" color="secondary">
                  Planowane wydanie:{' '}
                  {new Date(p.releaseDue).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              )}
              {p.pricePln != null && (
                <Text variant="nano" as="p" color="secondary">
                  {p.pricePln} zł
                </Text>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={() => onEdit(detail)}>
            Edytuj
          </Button>
          {detail.status === 'IN_DEPOT' && (
            <Button variant="primary" size="sm" onClick={() => setShowPickup(true)}>
              Wydaj klientowi
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text variant="nano" as="p" color="secondary">
        {label}
      </Text>
      <Text variant="body-sm" as="p" weight="bold">
        {value}
      </Text>
    </div>
  );
}
