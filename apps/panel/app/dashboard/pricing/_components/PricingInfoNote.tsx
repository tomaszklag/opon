import { Text } from '@opony/design-system-web';
import { IconInfo } from '../../../../components/icons';
import styles from '../pricing.module.css';

export function PricingInfoNote() {
  return (
    <div className={styles.infoNote}>
      <IconInfo width="14" height="14" />
      <Text variant="body-sm" as="p">
        <Text variant="body-sm" as="span" weight="bold">
          Zmiana cen wpływa tylko na nowe rezerwacje.
        </Text>{' '}
        Istniejące rezerwacje zachowują ceny sprzed zmiany. W okresie pilotażowym platforma nie
        pobiera prowizji.
      </Text>
    </div>
  );
}
