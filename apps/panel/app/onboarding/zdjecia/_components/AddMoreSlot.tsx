import { Text } from '@opony/design-system-web';
import styles from '../zdjecia.module.css';

interface AddMoreProps {
  onUpload: () => void;
  dim?: boolean;
}

export function AddMoreSlot({ onUpload, dim }: AddMoreProps) {
  return (
    <button
      type="button"
      className={styles.addMore}
      style={dim ? { opacity: 0.5 } : undefined}
      onClick={onUpload}
      aria-label="Dodaj zdjęcie"
    >
      <span className={styles.addMorePlus}>+</span>
      <Text variant="nano" as="span" className={styles.addMoreLabel}>
        Dodaj zdjęcie
      </Text>
    </button>
  );
}
