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
      <button className={styles.saveBtn} onClick={onSave} disabled={saving}>
        {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
      </button>
    </div>
  );
}
