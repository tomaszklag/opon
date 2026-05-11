'use client';

import { useState } from 'react';
import { Modal, Button, Text } from '@opony/design-system-web';

interface Props {
  isOpen: boolean;
  clientName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function PickupModal({ isOpen, clientName, onConfirm, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wydaj opony klientowi"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Przetwarzanie…' : 'Potwierdź wydanie'}
          </Button>
        </>
      }
    >
      <Text variant="body-sm" as="p" color="secondary">
        Potwierdzasz wydanie zestawu opon klientowi <strong>{clientName}</strong>? Opony zostaną
        oznaczone jako odebrane i zwolnią miejsce w składzie.
      </Text>
    </Modal>
  );
}
