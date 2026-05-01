import { useRouter } from 'next/navigation';
import { Text } from '@opony/design-system-web';
import { IconLockOutline } from '../../../components/icons';
import styles from '../dashboard.module.css';

interface Props {
  title: string;
  description: string;
  href: string;
  locked: boolean;
}

export function ActionTile({ title, description, href, locked }: Props) {
  const router = useRouter();

  return (
    <button
      className={`${styles.actionTile} ${locked ? styles.actionTileLocked : ''}`}
      onClick={() => !locked && router.push(href)}
      disabled={locked}
      title={locked ? 'Dostępne po zatwierdzeniu konta' : undefined}
    >
      <div className={styles.actionContent}>
        <Text variant="body" as="div" weight="bold" className={styles.actionTitle}>
          {title}
        </Text>
        <Text variant="body-sm" as="div" color="secondary" className={styles.actionDesc}>
          {description}
        </Text>
      </div>
      {locked && <IconLockOutline className={styles.lockIcon} width="13" height="13" />}
    </button>
  );
}
