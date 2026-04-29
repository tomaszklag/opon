import { Button, Text } from '@opony/design-system-web';
import { IconRefresh } from '../../../../components/icons';
import styles from '../hours.module.css';

interface Props {
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onRevert: () => void;
}

export function HoursActionBar({ dirty, saved, saving, onSave, onRevert }: Props) {
  return (
    <div className={styles.actionBar}>
      {dirty && (
        <Text variant="nano" as="span" className={styles.dirtyChip}>
          Niezapisane zmiany
        </Text>
      )}
      {saved && !dirty && (
        <Text variant="nano" as="span" className={styles.savedChip}>
          Zapisano
        </Text>
      )}
      {dirty && (
        <Button variant="ghost" size="sm" onClick={onRevert} disabled={saving}>
          <IconRefresh width="13" height="13" />
          Przywróć
        </Button>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={onSave}
        loading={saving}
        disabled={!dirty && !saving}
      >
        Zapisz zmiany
      </Button>
    </div>
  );
}
