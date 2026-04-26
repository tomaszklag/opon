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

export function FirmStep({ data, error, onSubmit, setField, setNip, setPostalCode }: Props) {
  return (
    <>
      <h1 className={styles.title}>Zarejestruj firmę</h1>
      <p className={styles.subtitle}>Podaj dane swojego warsztatu wulkanizacyjnego</p>

      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Nazwa firmy *</label>
            <input
              className={styles.input}
              value={data.name}
              onChange={setField('name')}
              placeholder="Wulkanizacja Jan Kowalski"
              required
              maxLength={200}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>NIP *</label>
            <input
              className={styles.input}
              value={data.nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="1234567890"
              pattern="\d{10}"
              title="10 cyfr bez myślników"
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Telefon kontaktowy *</label>
            <input
              className={styles.input}
              type="tel"
              value={data.phone}
              onChange={setField('phone')}
              placeholder="+48600000000"
              pattern="^\+48\d{9}$"
              title="Format: +48 i 9 cyfr"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>E-mail (opcjonalnie)</label>
            <input
              className={styles.input}
              type="email"
              value={data.email}
              onChange={setField('email')}
              placeholder="kontakt@firma.pl"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Ulica i numer *</label>
          <input
            className={styles.input}
            value={data.street}
            onChange={setField('street')}
            placeholder="ul. Przykładowa 12"
            required
            maxLength={200}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Miasto *</label>
            <input
              className={styles.input}
              value={data.city}
              onChange={setField('city')}
              placeholder="Warszawa"
              required
              maxLength={100}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Kod pocztowy *</label>
            <input
              className={styles.input}
              value={data.postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="00-000"
              pattern="\d{2}-\d{3}"
              title="Format: 00-000"
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Województwo *</label>
          <select
            className={styles.select}
            value={data.voivodeship}
            onChange={setField('voivodeship')}
            required
          >
            <option value="">Wybierz województwo</option>
            {VOIVODESHIPS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Opis (opcjonalnie)</label>
          <textarea
            className={styles.textarea}
            value={data.description}
            onChange={setField('description')}
            placeholder="Krótki opis usług, specjalizacji, sprzętu..."
            rows={3}
            maxLength={3000}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.btn}>
          Dalej →
        </button>
      </form>
    </>
  );
}
