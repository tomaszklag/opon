import { IconInfo } from '../../../../components/icons';
import styles from '../pricing.module.css';

export function PricingInfoNote() {
  return (
    <div className={styles.infoNote}>
      <IconInfo width="14" height="14" />
      <p>
        <strong>Zmiana cen wpływa tylko na nowe rezerwacje.</strong> Istniejące rezerwacje zachowują
        ceny sprzed zmiany. W okresie pilotażowym platforma nie pobiera prowizji.
      </p>
    </div>
  );
}
