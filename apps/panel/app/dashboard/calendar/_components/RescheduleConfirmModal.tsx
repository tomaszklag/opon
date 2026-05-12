'use client';

import { useState } from 'react';
import { Modal, Button, Toggle, Text } from '@opony/design-system-web';
import type { Booking } from '../../../../api-data-access/bookings';
import { formatTime } from '../calendar.utils';
import styles from '../calendar.module.css';

interface RescheduleConfirmModalProps {
  booking: Booking | null;
  newStartAt: string;
  newEndAt: string;
  isLoading: boolean;
  onConfirm: (notifyClient: boolean) => void;
  onCancel: () => void;
}

function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pl-PL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) +
    ' ' +
    d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  );
}

export function RescheduleConfirmModal({
  booking,
  newStartAt,
  newEndAt,
  isLoading,
  onConfirm,
  onCancel,
}: RescheduleConfirmModalProps) {
  const [notifyClient, setNotifyClient] = useState(true);

  if (!booking) return null;

  const oldTime = formatTime(booking.startAt);
  const newTime = formatTime(newStartAt);
  const oldDate = formatDatetime(booking.startAt);
  const newDate = formatDatetime(newStartAt);
  const sameDay = new Date(booking.startAt).toDateString() === new Date(newStartAt).toDateString();

  return (
    <Modal
      isOpen={!!booking}
      onClose={onCancel}
      title="Przenieś rezerwację"
      size="sm"
      footer={
        <>
          <Button variant="neutral" size="md" onClick={onCancel} type="button" disabled={isLoading}>
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => onConfirm(notifyClient)}
            loading={isLoading}
          >
            Przenieś
          </Button>
        </>
      }
    >
      <div className={styles.rescheduleBody}>
        <Text variant="body-sm" as="p" color="secondary">
          Przenosisz wizytę klienta{' '}
          <Text variant="body-sm" as="span" weight="bold" color="primary">
            {booking.clientName}
          </Text>
          :
        </Text>

        <div className={styles.rescheduleRow}>
          <div className={styles.rescheduleFrom}>
            <Text variant="nano" as="div" color="muted" className={styles.rescheduleLabel}>
              Obecny termin
            </Text>
            <Text variant="body-sm" as="div" weight="bold" color="primary">
              {sameDay ? oldTime : oldDate}
            </Text>
          </div>
          <span className={styles.rescheduleArrow}>→</span>
          <div className={styles.rescheduleTo}>
            <Text variant="nano" as="div" color="muted" className={styles.rescheduleLabel}>
              Nowy termin
            </Text>
            <Text variant="body-sm" as="div" weight="bold" color="primary">
              {sameDay ? newTime : newDate}
            </Text>
          </div>
        </div>

        <div className={styles.rescheduleNotify}>
          <Toggle
            checked={notifyClient}
            onChange={(e) => setNotifyClient(e.target.checked)}
            label="Powiadom klienta SMS"
          />
          <Text variant="body-sm" as="p" color="muted" className={styles.rescheduleNotifyHint}>
            Klient otrzyma SMS z nowym terminem wizyty.
          </Text>
        </div>
      </div>
    </Modal>
  );
}
