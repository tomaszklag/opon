import { Input, PhoneInput, Select, Textarea, Button } from '@opony/design-system-web';
import { type FirmData, VOIVODESHIPS } from '../../../lib/hooks/use-register-flow';
import styles from '../register.module.css';

interface Props {
  data: FirmData;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
  setField: (
    field: keyof FirmData,
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  setNip: (val: string) => void;
  setPostalCode: (val: string) => void;
}

const voivodeshipOptions = VOIVODESHIPS.map((v) => ({ value: v, label: v }));

export function FirmStep({ data, error, onSubmit, setField, setNip, setPostalCode }: Props) {
  return (
    <>
      <h1 className={styles.title}>Zarejestruj firmę</h1>
      <p className={styles.subtitle}>Podaj dane swojego warsztatu wulkanizacyjnego</p>

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.row}>
          <Input
            label="Nazwa firmy"
            value={data.name}
            onChange={setField('name')}
            placeholder="Wulkanizacja Jan Kowalski"
            required
            maxLength={200}
          />
          <Input
            label="NIP"
            value={data.nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="1234567890"
            pattern="\d{10}"
            title="10 cyfr bez myślników"
            required
          />
        </div>

        <div className={styles.row}>
          <PhoneInput
            label="Telefon kontaktowy"
            value={data.phone.replace(/^\+48/, '')}
            onChange={(e) =>
              setField('phone')({ ...e, target: { ...e.target, value: '+48' + e.target.value } })
            }
            placeholder="600 000 000"
            required
          />
          <Input
            label="E-mail (opcjonalnie)"
            type="email"
            value={data.email}
            onChange={setField('email')}
            placeholder="kontakt@firma.pl"
          />
        </div>

        <Input
          label="Ulica i numer"
          value={data.street}
          onChange={setField('street')}
          placeholder="ul. Przykładowa 12"
          required
          maxLength={200}
        />

        <div className={styles.row}>
          <Input
            label="Miasto"
            value={data.city}
            onChange={setField('city')}
            placeholder="Warszawa"
            required
            maxLength={100}
          />
          <Input
            label="Kod pocztowy"
            value={data.postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="00-000"
            pattern="\d{2}-\d{3}"
            title="Format: 00-000"
            required
          />
        </div>

        <Select
          label="Województwo"
          options={voivodeshipOptions}
          placeholder="Wybierz województwo"
          value={data.voivodeship}
          onChange={setField('voivodeship')}
          required
        />

        <Textarea
          label="Opis (opcjonalnie)"
          value={data.description}
          onChange={setField('description')}
          placeholder="Krótki opis usług, specjalizacji, sprzętu..."
          rows={3}
          maxLength={3000}
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button type="submit" variant="primary" fullWidth>
          Dalej →
        </Button>
      </form>
    </>
  );
}
