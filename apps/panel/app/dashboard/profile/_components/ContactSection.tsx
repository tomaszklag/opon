import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { type ProviderFormValues } from '../../../../lib/schemas/provider.schema';
import styles from '../profile.module.css';

interface Props {
  register: UseFormRegister<ProviderFormValues>;
  errors: FieldErrors<ProviderFormValues>;
}

export function ContactSection({ register, errors }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.secHead}>
        <h2 className={styles.secTitle}>Kontakt</h2>
        <span className={styles.secKicker}>Widoczne dla klientów</span>
      </header>

      <div className={[styles.fieldRow, styles.fieldRowTwo].join(' ')}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-phone">
            Telefon
          </label>
          <input
            id="f-phone"
            className={[styles.input, errors.phone ? styles.inputError : ''].join(' ')}
            type="tel"
            placeholder="+48600000000"
            {...register('phone')}
          />
          {errors.phone ? (
            <span className={styles.fieldError}>{errors.phone.message}</span>
          ) : (
            <span className={styles.fieldHint}>Format: +48 i numer, bez spacji</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="f-email">
            E-mail kontaktowy
          </label>
          <input
            id="f-email"
            className={[styles.input, errors.email ? styles.inputError : ''].join(' ')}
            type="email"
            placeholder="kontakt@firma.pl"
            {...register('email')}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </div>
      </div>
    </section>
  );
}
