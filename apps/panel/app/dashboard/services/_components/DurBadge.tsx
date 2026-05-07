import { Text } from '@opony/design-system-web';
import styles from './DurBadge.module.css';

interface Props {
  minutes: number;
  plain?: boolean;
}

export function DurBadge({ minutes, plain }: Props) {
  if (plain) {
    return (
      <Text variant="nano" as="span" mono color="secondary">
        {minutes} min
      </Text>
    );
  }
  return <span className={styles.badge}>{minutes} min</span>;
}
