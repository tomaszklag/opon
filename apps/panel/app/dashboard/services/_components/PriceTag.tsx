import { Text } from '@opony/design-system-web';

interface Props {
  value: number;
  max?: number;
  from?: boolean;
  prefix?: string;
  bold?: boolean;
  muted?: boolean;
  size?: 'nano' | 'sm';
}

export function PriceTag({ value, max, from, prefix, bold, muted, size = 'nano' }: Props) {
  let label: string;
  if (from) {
    label = `od ${value} zł`;
  } else if (max !== undefined && max !== value) {
    label = `${value}–${max} zł`;
  } else {
    label = `${prefix ?? ''}${value} zł`;
  }

  return (
    <Text
      variant={size === 'sm' ? 'body-sm' : 'nano'}
      as="span"
      mono
      weight={bold ? 'bold' : undefined}
      color={muted ? 'secondary' : undefined}
    >
      {label}
    </Text>
  );
}
