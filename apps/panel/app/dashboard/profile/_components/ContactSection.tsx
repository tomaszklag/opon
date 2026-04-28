import { Input, Heading } from '@opony/design-system-web';
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
        <Heading variant="section" as="h2" className={styles.secTitle}>
          Kontakt
        </Heading>
        <span className={styles.secKicker}>Widoczne dla klientów</span>
      </header>

      <div className={[styles.fieldRow, styles.fieldRowTwo].join(' ')}>
        <Input
          label="Telefon"
          type="tel"
          placeholder="+48600000000"
          hint={errors.phone ? undefined : 'Format: +48 i numer, bez spacji'}
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="E-mail kontaktowy"
          type="email"
          placeholder="kontakt@firma.pl"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
    </section>
  );
}
