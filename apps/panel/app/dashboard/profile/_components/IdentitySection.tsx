import { Input, Textarea } from '@opony/design-system-web';
import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { type ProviderFormValues } from '../../../../lib/schemas/provider.schema';
import { IconLock } from '../../../../components/icons';
import styles from '../profile.module.css';

const DESC_MAX = 3000;

interface Props {
  register: UseFormRegister<ProviderFormValues>;
  errors: FieldErrors<ProviderFormValues>;
  description: string;
  nip: string;
}

export function IdentitySection({ register, errors, description, nip }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.secHead}>
        <h2 className={styles.secTitle}>Tożsamość firmy</h2>
        <span className={styles.secKicker}>Widoczne publicznie</span>
      </header>

      <div className={[styles.fieldRow, styles.fieldRowTwo].join(' ')}>
        <Input
          label="Nazwa wyświetlana"
          error={errors.name?.message}
          maxLength={200}
          required
          {...register('name')}
        />

        <div className={styles.field}>
          <span className={styles.label}>NIP</span>
          <div className={styles.lockedInput}>
            <IconLock width="13" height="13" className={styles.lockIco} />
            <span className={styles.lockedVal}>{nip}</span>
            <span className={styles.lockedTag}>Niezmienialny</span>
          </div>
        </div>
      </div>

      <Textarea
        label="Opis warsztatu"
        error={errors.description?.message}
        value={description}
        rows={4}
        maxLength={DESC_MAX}
        {...register('description')}
      />
    </section>
  );
}
