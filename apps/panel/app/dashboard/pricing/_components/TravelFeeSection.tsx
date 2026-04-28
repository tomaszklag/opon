import { Heading, Text, Input } from '@opony/design-system-web';
import { type TravelFee } from '../../../../lib/hooks/use-pricing-tiers';
import styles from '../pricing.module.css';

interface Props {
  travelFee: TravelFee;
  onUpdate: (zone1: number, zone2: number) => void;
}

export function TravelFeeSection({ travelFee, onUpdate }: Props) {
  return (
    <section className={styles.secCard} aria-labelledby="sec-travel">
      <div className={styles.secHead}>
        <Heading variant="section" as="h2" id="sec-travel" className={styles.secTitle}>
          Dopłaty za dojazd
        </Heading>
        <span className={styles.secSub}>Mobilny punkt · strefy promieniowe</span>
      </div>

      <div className={styles.addonRow}>
        <div className={styles.addonInfo}>
          <Text variant="body-sm" as="span" weight="semibold">
            0 – 10 km od bazy
          </Text>
          <Text variant="nano" as="p" color="muted">
            Najbliższe dzielnice — 82% wizyt
          </Text>
        </div>
        <Input
          type="number"
          min={0}
          step={1}
          value={travelFee.zone1}
          suffix={<span>zł</span>}
          onChange={(e) => onUpdate(Number(e.target.value), travelFee.zone2)}
          aria-label="Dopłata za dojazd 0–10 km"
          className={styles.priceInputNum}
        />
      </div>

      <div className={styles.addonRow}>
        <div className={styles.addonInfo}>
          <Text variant="body-sm" as="span" weight="semibold">
            10 – 15 km od bazy
          </Text>
          <Text variant="nano" as="p" color="muted">
            Okolice, gminy ościenne
          </Text>
        </div>
        <Input
          type="number"
          min={0}
          step={1}
          value={travelFee.zone2}
          suffix={<span>zł</span>}
          onChange={(e) => onUpdate(travelFee.zone1, Number(e.target.value))}
          aria-label="Dopłata za dojazd 10–15 km"
          className={styles.priceInputNum}
        />
      </div>
    </section>
  );
}
