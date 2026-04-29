import { Text } from '@opony/design-system-web';
import styles from '../profile.module.css';

interface Props {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}

export function TypeCard({ label, description, icon, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      className={[styles.typeCard, selected ? styles.typeCardSelected : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span
        className={[styles.typeIco, selected ? styles.typeIcoSelected : '']
          .filter(Boolean)
          .join(' ')}
      >
        {icon}
      </span>
      <Text variant="body-sm" as="span" weight="extrabold">
        {label}
      </Text>
      <Text variant="nano" as="span" color={selected ? 'secondary' : 'muted'}>
        {description}
      </Text>
    </button>
  );
}
