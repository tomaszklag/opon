'use client';

import { useRouter } from 'next/navigation';
import { Modal, Button, Spinner, Text } from '@opony/design-system-web';
import type { BookingDetail, BookingStatus } from '../../../api-data-access/bookings';
import { useBookingDetail } from '../../../lib/hooks/use-booking-detail';

interface Props {
  referenceCode: string | null;
  onClose: () => void;
}

type TextColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'warning' | 'danger';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Oczekuje',
  CONFIRMED: 'Potwierdzona',
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Zakończona',
  CANCELLED_BY_CLIENT: 'Anulowana',
  CANCELLED_BY_PROVIDER: 'Anulowana',
  CANCELLED_BY_SYSTEM: 'Anulowana',
  REJECTED: 'Odrzucona',
  NO_SHOW: 'Nieobecność',
};

const STATUS_COLOR: Record<BookingStatus, TextColor> = {
  PENDING: 'warning',
  CONFIRMED: 'accent',
  IN_PROGRESS: 'accent',
  COMPLETED: 'secondary',
  CANCELLED_BY_CLIENT: 'muted',
  CANCELLED_BY_PROVIDER: 'muted',
  CANCELLED_BY_SYSTEM: 'muted',
  REJECTED: 'danger',
  NO_SHOW: 'muted',
};

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleString('pl-PL', opts);
}

export function BookingDetailModal({ referenceCode, onClose }: Props) {
  const router = useRouter();

  return (
    <Modal
      isOpen={referenceCode !== null}
      onClose={onClose}
      title={referenceCode ? `Wizyta · ${referenceCode}` : 'Wizyta'}
      size="sm"
      footer={
        referenceCode ? (
          <>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Zamknij
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/dashboard/bookings/${referenceCode}`)}
            >
              Otwórz szczegóły
            </Button>
          </>
        ) : undefined
      }
    >
      {referenceCode && <DetailContent referenceCode={referenceCode} />}
    </Modal>
  );
}

function DetailContent({ referenceCode }: { referenceCode: string }) {
  const { booking, isLoading } = useBookingDetail(referenceCode);

  if (isLoading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center' }}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!booking) return null;

  const statusLabel = STATUS_LABEL[booking.status] ?? booking.status;
  const statusColor: TextColor = STATUS_COLOR[booking.status] ?? 'secondary';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Text variant="nano" weight="bold" mono color={statusColor}>
          {statusLabel}
        </Text>
        <Text variant="body-sm" color="secondary">
          {fmt(booking.startAt, { weekday: 'short', day: 'numeric', month: 'short' })},{' '}
          {fmt(booking.startAt, { hour: '2-digit', minute: '2-digit' })}
          {' – '}
          {fmt(booking.endAt, { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
        <DataRow label="Klient" value={booking.client.clientName} />
        <DataRow label="Telefon" value={booking.client.clientPhone} />
        {booking.serviceType && <DataRow label="Usługa" value={booking.serviceType} />}
        {booking.tireSize && <DataRow label="Opony" value={booking.tireSize} />}
        {booking.totalPricePln != null && (
          <DataRow label="Cena" value={`${booking.totalPricePln} zł`} />
        )}
        {booking.isManual && <DataRow label="Źródło" value="Ręczna" />}
      </div>

      {booking.notes && (
        <div>
          <Text variant="nano" color="secondary" weight="bold" as="p" style={{ marginBottom: 4 }}>
            Uwagi
          </Text>
          <Text variant="body-sm" as="p">
            {booking.notes}
          </Text>
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text variant="nano" color="secondary" as="p">
        {label}
      </Text>
      <Text variant="body-sm" weight="bold" as="p">
        {value}
      </Text>
    </div>
  );
}
