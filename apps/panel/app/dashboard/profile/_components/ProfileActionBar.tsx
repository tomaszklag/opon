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
      <button className={styles.saveBtn} onClick={onSubmit} disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Zapisywanie…' : 'Zapisz zmiany'}
      </button>
    </div>
  );
}
