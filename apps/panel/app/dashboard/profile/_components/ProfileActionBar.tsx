import { Button } from '@opony/design-system-web';
import styles from '../profile.module.css';

interface Props {
  isDirty: boolean;
  saved: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ProfileActionBar({ isDirty, saved, isSubmitting, onSubmit }: Props) {
  return (
    <div className={styles.actionBar}>
      {isDirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
      {saved && <span className={styles.savedChip}>Zapisano</span>}
      <Button
        variant="primary"
        onClick={onSubmit}
        disabled={isSubmitting || !isDirty}
        loading={isSubmitting}
      >
        Zapisz zmiany
      </Button>
    </div>
  );
}
