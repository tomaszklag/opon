import { useState } from 'react';
import { Button, Input, Text } from '@opony/design-system-web';
import { IconPlus } from '../../../../components/icons';
import styles from '../workers.module.css';

interface Props {
  saving: boolean;
  onAdd: (name: string, role?: string) => Promise<void>;
  onCancel: () => void;
}

export function AddWorkerForm({ saving, onAdd, onCancel }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Imię i nazwisko jest wymagane');
      return;
    }
    setNameError(undefined);
    setSubmitError(null);
    try {
      await onAdd(name.trim(), role.trim() || undefined);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Błąd dodawania pracownika');
    }
  }

  return (
    <form className={styles.addWorkerForm} onSubmit={handleSubmit}>
      <Text variant="nano" as="p" weight="bold" color="accent">
        Nowy pracownik
      </Text>
      <div className={styles.addWorkerFormRow}>
        <Input
          label="Imię i nazwisko"
          placeholder="np. Jan Kowalski"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(undefined);
          }}
          error={nameError}
          required
          autoFocus
        />
        <Input
          label="Stanowisko / rola (opcjonalne)"
          placeholder="np. Mechanik"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      {submitError && (
        <Text variant="body-sm" as="p" color="secondary" style={{ color: 'var(--danger)' }}>
          {submitError}
        </Text>
      )}
      <div className={styles.addWorkerFormActions}>
        <Button variant="primary" size="sm" type="submit" loading={saving} disabled={saving}>
          <IconPlus width="12" height="12" />
          Dodaj pracownika
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={onCancel} disabled={saving}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
