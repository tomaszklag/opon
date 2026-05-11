import { Heading, Text } from '@opony/design-system-web';
import type { DepotStats } from '../../../../api-data-access/depot';
import styles from '../depot.module.css';

interface Props {
  stats: DepotStats | null;
}

export function DepotKpi({ stats }: Props) {
  return (
    <div className={styles.kpiRow}>
      <div className={styles.kpiCard}>
        <Text variant="nano" as="span" color="secondary">
          W składzie
        </Text>
        <div className={styles.kpiValue}>
          <Heading variant="section" as="h3">
            {stats?.inDepot ?? '—'}
          </Heading>
        </div>
        <Text variant="nano" as="span" color="secondary">
          zestawów
        </Text>
      </div>

      <div className={styles.kpiCard}>
        <Text variant="nano" as="span" color="secondary">
          Do wydania (30 dni)
        </Text>
        <div className={styles.kpiValue}>
          <Heading variant="section" as="h3">
            {stats?.dueSoon ?? '—'}
          </Heading>
        </div>
        <Text variant="nano" as="span" color="secondary">
          zestawów
        </Text>
      </div>

      <div className={styles.kpiCard}>
        <Text variant="nano" as="span" color="secondary">
          Przychód w tym miesiącu
        </Text>
        <div className={styles.kpiValue}>
          <Heading variant="section" as="h3">
            {stats
              ? `${stats.revenueMonth.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} zł`
              : '—'}
          </Heading>
        </div>
      </div>
    </div>
  );
}
