import { Text } from '@opony/design-system-web';
import { IconLock, IconShield } from '../../../components/icons';
import styles from '../login.module.css';

export function LoginFooter() {
  return (
    <footer className={styles.formFooter}>
      <Text variant="nano" as="div" className={styles.legalRow}>
        <a href="#">Regulamin</a>
        <span className={styles.legalSep}>·</span>
        <a href="#">Polityka prywatności</a>
        <span className={styles.legalSep}>·</span>
        <a href="#">RODO</a>
      </Text>
      <div className={styles.trustCluster}>
        <Text variant="nano" as="span" className={styles.trustBadge}>
          <IconLock className={styles.badgeIco} />
          TLS 1.3
        </Text>
        <Text variant="nano" as="span" className={styles.trustBadge}>
          <IconShield className={styles.badgeIco} />
          RODO
        </Text>
      </div>
    </footer>
  );
}
