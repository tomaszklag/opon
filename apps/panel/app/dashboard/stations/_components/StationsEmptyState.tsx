import { Button, Heading, Text } from '@opony/design-system-web';
import { IconStations, IconPlus } from '../../../../components/icons';
import styles from '../stations.module.css';

interface Props {
  onCreate: () => void;
  creating?: boolean;
}

export function StationsEmptyState({ onCreate, creating }: Props) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <IconStations width="24" height="24" />
      </div>
      <div>
        <Heading variant="section" as="h2">
          Brak stanowisk
        </Heading>
        <Text variant="body-sm" as="p" color="secondary">
          Dodaj pierwsze stanowisko, aby zarządzać capacity warsztatu.
        </Text>
      </div>
      <Button variant="primary" size="sm" onClick={onCreate} loading={creating}>
        <IconPlus width="13" height="13" />
        Dodaj stanowisko
      </Button>
    </div>
  );
}
