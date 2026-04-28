import { Heading, Input, Text, Toggle } from '@opony/design-system-web';
import { IconPlus } from '../../../../components/icons';
import styles from '../pricing.module.css';

interface Props {
  balancingEnabled: boolean;
  balancingPrice: number;
  onUpdate: (enabled: boolean, price: number) => void;
}

export function ServicesSection({ balancingEnabled, balancingPrice, onUpdate }: Props) {
  return (
    <section className={styles.secCard} aria-labelledby="sec-services">
      <div className={styles.secHead}>
        <Heading variant="section" as="h2" id="sec-services" className={styles.secTitle}>
          Dodatkowe usługi
        </Heading>
        <span className={styles.secSub}>Opcjonalne · klient dobiera przy rezerwacji</span>
      </div>

      <div className={styles.serviceRow}>
        <Toggle
          size="sm"
          checked={balancingEnabled}
          onChange={(e) => onUpdate(e.target.checked, balancingPrice)}
          aria-label="Włącz wyważanie"
        />
        <div className={styles.addonInfo}>
          <Text variant="body-sm" as="span" weight="semibold">
            Wyważanie
          </Text>
          <Text variant="nano" as="p" color="muted">
            {balancingEnabled
              ? 'Klient może zaznaczyć przy rezerwacji'
              : 'Wyłączone — nie będzie widoczne dla klientów'}
          </Text>
        </div>
        {balancingEnabled && (
          <Input
            type="number"
            min={0}
            step={1}
            value={balancingPrice}
            suffix={<span>zł / koło</span>}
            onChange={(e) => onUpdate(balancingEnabled, Number(e.target.value))}
            aria-label="Cena wyważania za koło"
            className={styles.priceInputNum}
          />
        )}
      </div>

      <button className={styles.addServiceBtn} type="button" disabled>
        <IconPlus width="12" height="12" />
        Dodaj usługę (np. sezonowy depozyt opon)
      </button>
    </section>
  );
}
