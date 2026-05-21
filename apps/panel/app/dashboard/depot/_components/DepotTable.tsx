import { Text } from '@opony/design-system-web';
import type { TireSet } from '../../../../api-data-access/depot';
import styles from '../depot.module.css';

interface Props {
  items: TireSet[];
  onSelect: (id: string) => void;
}

const TIRE_TYPE_LABEL: Record<string, string> = {
  SUMMER: 'Letnie',
  WINTER: 'Zimowe',
  ALL_SEASON: 'Całoroczne',
};

type TextColor = 'secondary' | 'warning' | 'danger';

const CONDITION_COLOR: Record<string, TextColor> = {
  GOOD: 'secondary',
  WORN: 'warning',
  CRITICAL: 'danger',
};

const CONDITION_LABEL: Record<string, string> = {
  GOOD: 'Dobry',
  WORN: 'Zużyte',
  CRITICAL: 'Krytyczny',
};

export function DepotTable({ items, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text variant="body-sm" as="p" color="secondary">
          Brak zestawów spełniających kryteria wyszukiwania.
        </Text>
      </div>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Klient
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Pojazd
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Opony
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Lokalizacja
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Do wydania
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Stan
            </Text>
          </th>
          <th>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              Status
            </Text>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((ts) => (
          <tr key={ts.id} onClick={() => onSelect(ts.id)}>
            <td>
              <Text variant="body-sm" as="p" weight="bold">
                {ts.clientName}
              </Text>
              <Text variant="nano" as="p" color="secondary">
                {ts.clientPhone}
              </Text>
            </td>
            <td>
              <Text variant="body-sm" as="p">
                {ts.vehicleName ?? '—'}
              </Text>
              {ts.licensePlate && (
                <Text variant="nano" as="p" color="secondary">
                  {ts.licensePlate}
                </Text>
              )}
            </td>
            <td>
              <Text variant="body-sm" as="p">
                {ts.tireSize} · {TIRE_TYPE_LABEL[ts.tireType] ?? ts.tireType}
              </Text>
              {(ts.brand || ts.model) && (
                <Text variant="nano" as="p" color="secondary">
                  {[ts.brand, ts.model].filter(Boolean).join(' ')}
                </Text>
              )}
            </td>
            <td>
              <Text variant="body-sm" as="p">
                {ts.slotLabel ?? '—'}
              </Text>
            </td>
            <td>
              {ts.releaseDue ? (
                <Text variant="body-sm" as="p">
                  {new Date(ts.releaseDue).toLocaleDateString('pl-PL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              ) : (
                <Text variant="body-sm" as="p" color="secondary">
                  —
                </Text>
              )}
            </td>
            <td>
              <Text
                variant="nano"
                as="span"
                weight="bold"
                color={CONDITION_COLOR[ts.condition] ?? 'secondary'}
              >
                {CONDITION_LABEL[ts.condition] ?? ts.condition}
              </Text>
            </td>
            <td>
              <span
                className={`${styles.statusChip} ${ts.status === 'IN_DEPOT' ? styles.statusInDepot : styles.statusPickedUp}`}
              >
                <Text
                  variant="nano"
                  as="span"
                  weight="bold"
                  mono
                  color={ts.status === 'IN_DEPOT' ? 'accent' : 'secondary'}
                >
                  {ts.status === 'IN_DEPOT' ? 'W składzie' : 'Wydany'}
                </Text>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
