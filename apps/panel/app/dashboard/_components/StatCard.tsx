import { Text } from '@opony/design-system-web';
import styles from '../dashboard.module.css';

interface Props {
  label: string;
  value: string;
}

export function StatCard({ label, value }: Props) {
  return (
    <div className={styles.statCard}>
      <Text variant="label" as="div" className={styles.statLabel}>
        {label}
      </Text>
      <Text variant="kicker" as="div" weight="bold" className={styles.statValue}>
        {value}
      </Text>
    </div>
  );
}
