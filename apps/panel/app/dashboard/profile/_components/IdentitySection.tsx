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
        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-name">
            Nazwa wyświetlana <span className={styles.req}>*</span>
          </label>
          <input
            id="f-name"
            className={[styles.input, errors.name ? styles.inputError : ''].join(' ')}
            type="text"
            maxLength={200}
            {...register('name')}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>NIP</span>
          <div className={styles.lockedInput}>
            <IconLock width="13" height="13" className={styles.lockIco} />
            <span className={styles.lockedVal}>{nip}</span>
            <span className={styles.lockedTag}>Niezmienialny</span>
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="f-desc">
          Opis warsztatu
        </label>
        <textarea
          id="f-desc"
          className={[styles.textarea, errors.description ? styles.inputError : ''].join(' ')}
          rows={4}
          maxLength={DESC_MAX}
          {...register('description')}
        />
        <div className={styles.charCounter}>
          <strong>{description.length}</strong> / {DESC_MAX}
        </div>
        {errors.description && (
          <span className={styles.fieldError}>{errors.description.message}</span>
        )}
      </div>
    </section>
  );
}
