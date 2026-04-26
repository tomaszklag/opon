import styles from '../pricing.module.css';

interface Props {
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  showAddForm: boolean;
  onOpenAddForm: () => void;
  onSave: () => void;
}

export function PricingActionBar({
  dirty,
  saved,
  saving,
  showAddForm,
  onOpenAddForm,
  onSave,
}: Props) {
  return (
    <div className={styles.actionBar}>
      {dirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
      {saved && <span className={styles.savedChip}>Zapisano</span>}
      <button className={styles.addBtn} onClick={onOpenAddForm} disabled={showAddForm}>
        + Dodaj przedział
      </button>
      <button
        className={styles.saveBtn}
        onClick={onSave}
        disabled={saving || (!dirty && !showAddForm)}
      >
        {saving ? 'Zapisywanie…' : 'Zapisz cennik'}
      </button>
    </div>
  );
}
