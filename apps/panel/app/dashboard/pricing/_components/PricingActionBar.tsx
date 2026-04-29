import { Button, Text } from '@opony/design-system-web';
import styles from '../pricing.module.css';

interface Props {
  dirty: boolean;
  saved: boolean;
  saving: boolean;
  showAddForm: boolean;
  allTiersDefined: boolean;
  onOpenAddForm: () => void;
  onSave: () => void;
  onRevert: () => void;
}

export function PricingActionBar({
  dirty,
  saved,
  saving,
  showAddForm,
  allTiersDefined,
  onOpenAddForm,
  onSave,
  onRevert,
}: Props) {
  return (
    <div className={styles.actionBar}>
      {dirty && !saved && (
        <Text variant="label" as="span" className={styles.dirtyChip}>
          Niezapisane zmiany
        </Text>
      )}
      {saved && (
        <Text variant="label" as="span" className={styles.savedChip}>
          Zapisano
        </Text>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={onOpenAddForm}
        disabled={showAddForm || allTiersDefined}
      >
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
