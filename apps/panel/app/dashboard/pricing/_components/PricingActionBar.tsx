import { Button } from '@opony/design-system-web';
import styles from '../pricing.module.css';

interface Props {
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  showAddForm: boolean;
  onOpenAddForm: () => void;
  onSave: () => void;
  onRevert: () => void;
}

export function PricingActionBar({
  dirty,
  saved,
  saving,
  showAddForm,
  onOpenAddForm,
  onSave,
  onRevert,
}: Props) {
  return (
    <div className={styles.actionBar}>
      {dirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
      {saved && <span className={styles.savedChip}>Zapisano</span>}
      <Button variant="secondary" size="sm" onClick={onOpenAddForm} disabled={showAddForm}>
        + Dodaj przedział
      </Button>
      {dirty && (
        <Button variant="ghost" size="sm" onClick={onRevert}>
          Cofnij
        </Button>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={onSave}
        loading={saving}
        disabled={!dirty && !showAddForm}
      >
        Zapisz cennik
      </Button>
    </div>
  );
}
