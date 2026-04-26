import { type UseFormRegister, type FieldErrors } from 'react-hook-form';
import { type ProviderFormValues } from '../../../../lib/schemas/provider.schema';
import styles from '../profile.module.css';

interface Props {
  register: UseFormRegister<ProviderFormValues>;
  errors: FieldErrors<ProviderFormValues>;
  cityCenterLat: number | null | undefined;
  cityCenterLng: number | null | undefined;
  status: string;
}

export function LocationSection({ register, errors, cityCenterLat, cityCenterLng, status }: Props) {
  return (
    <section className={styles.section}>
      <header className={styles.secHead}>
        <h2 className={styles.secTitle}>Lokalizacja</h2>
        <span className={styles.secKicker}>Dane z rejestracji</span>
      </header>

      <div className={styles.metaRow}>
        <div className={styles.metaPill}>
          <span className={styles.metaPillLabel}>Lat</span>
          <span className={styles.metaPillVal}>
            {cityCenterLat != null ? cityCenterLat.toFixed(4) : '—'}
          </span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaPillLabel}>Lng</span>
          <span className={styles.metaPillVal}>
            {cityCenterLng != null ? cityCenterLng.toFixed(4) : '—'}
          </span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaPillLabel}>Status konta</span>
          <span className={styles.metaPillVal}>{status}</span>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="f-logo">
          URL logo
        </label>
        <input
          id="f-logo"
          className={[styles.input, errors.logoUrl ? styles.inputError : ''].join(' ')}
          type="url"
          placeholder="https://example.com/logo.png"
          {...register('logoUrl')}
        />
        {errors.logoUrl ? (
          <span className={styles.fieldError}>{errors.logoUrl.message}</span>
        ) : (
          <span className={styles.fieldHint}>Publiczny URL obrazka PNG/JPG, min 200×200 px</span>
        )}
      </div>
    </section>
  );
}
