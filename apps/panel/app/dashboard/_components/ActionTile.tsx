import { useRouter } from 'next/navigation';
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
        <div className={styles.actionTitle}>{title}</div>
        <div className={styles.actionDesc}>{description}</div>
      </div>
      {locked && <IconLockOutline className={styles.lockIcon} width="13" height="13" />}
    </button>
  );
}
