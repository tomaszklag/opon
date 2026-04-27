import { Controller, type UseFormReturn } from 'react-hook-form';
import { Input, Button } from '@opony/design-system-web';
import { type NewTierValues } from '../../../../lib/schemas/pricing.schema';
import styles from '../pricing.module.css';

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
        <span className={styles.rimLabel}>Felga</span>
        <Controller
          name="rimSizeMin"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min={10}
              max={24}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              error={errors.rimSizeMin?.message ? ' ' : undefined}
              aria-label="Rozmiar felgi od"
              className={styles.rimInputDs}
            />
          )}
        />
        <span className={styles.rimSep}>–</span>
        <Controller
          name="rimSizeMax"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              min={10}
              max={24}
              value={field.value}
              onChange={(e) => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              error={errors.rimSizeMax?.message ? ' ' : undefined}
              aria-label="Rozmiar felgi do"
              className={styles.rimInputDs}
            />
          )}
        />
        <span className={styles.rimUnit}>cali</span>
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
            className={styles.priceInputDs}
          />
        )}
      />

      <Button variant="ghost" size="sm" onClick={onCancel}>
        Anuluj
      </Button>
    </div>
  );
}
