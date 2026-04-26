import { Button } from '@opony/design-system-web';
import styles from '../hours.module.css';

interface Props {
  saved: boolean;
  saving: boolean;
  onSave: () => void;
}

export function HoursActionBar({ saved, saving, onSave }: Props) {
  return (
    <div className={styles.actionBar}>
      {saved && <span className={styles.savedChip}>Zapisano</span>}
      <Button variant="primary" size="sm" onClick={onSave} loading={saving}>
        Zapisz zmiany
      </Button>
    </div>
  );
}
