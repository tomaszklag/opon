import { Controller, type UseFormReturn } from 'react-hook-form';
import { Input, Button, Select, Text } from '@opony/design-system-web';
import { type NewTierValues } from '../../../../lib/schemas/pricing.schema';
import { sizeTierLabel, type SizeTierValue } from './utils';
import styles from '../pricing.module.css';

const SIZE_TIERS: SizeTierValue[] = ['S', 'M', 'L'];

const SIZE_TIER_OPTIONS = SIZE_TIERS.map((s) => ({
  value: s,
  label: sizeTierLabel(s),
}));

interface Props {
  form: UseFormReturn<NewTierValues>;
  onCancel: () => void;
}

export function NewTierForm({ form, onCancel }: Props) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className={[styles.tierRow, styles.tierRowNew].join(' ')}>
      <div className={styles.rimRangeInputs}>
        <Text variant="body-sm" as="span" color="muted" className={styles.rimLabel}>
          Rozmiar
        </Text>
        <Controller
          name="sizeTier"
          control={control}
          render={({ field }) => (
            <Select
              options={SIZE_TIER_OPTIONS}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={errors.sizeTier?.message ? ' ' : undefined}
              aria-label="Tier rozmiaru felgi"
            />
          )}
        />
      </div>

      <Controller
        name="priceSwapPln"
        control={control}
        render={({ field, fieldState }) => (
          <Input
            type="number"
            min={1}
            step={1}
            value={field.value || ''}
            placeholder="0"
            suffix={<span>zł</span>}
            onChange={(e) => field.onChange(Number(e.target.value))}
            onBlur={field.onBlur}
            error={fieldState.error?.message ? ' ' : undefined}
            aria-label="Cena wymiany"
            className={styles.priceInputNum}
          />
        )}
      />

      <Button variant="ghost" size="sm" onClick={onCancel}>
        Anuluj
      </Button>
    </div>
  );
}
