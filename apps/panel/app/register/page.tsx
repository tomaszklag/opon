'use client';

import { useRegisterFlow, VOIVODESHIPS } from '../../lib/hooks/use-register-flow';
import styles from './register.module.css';

export default function RegisterPage() {
  const {
    step,
    data,
    error,
    loading,
    setField,
    setNip,
    setPostalCode,
    handleFirmNext,
    handleSubmit,
    goBack,
  } = useRegisterFlow();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>opony.app</div>

        <div className={styles.steps}>
          <div
            className={`${styles.step} ${step === 'firm' ? styles.stepActive : styles.stepDone}`}
          >
            <span className={styles.stepNum}>1</span>
            <span>Dane firmy</span>
          </div>
          <div className={styles.stepLine} />
          <div className={`${styles.step} ${step === 'confirm' ? styles.stepActive : ''}`}>
            <span className={styles.stepNum}>2</span>
            <span>Potwierdzenie</span>
          </div>
        </div>

        {step === 'firm' ? (
          <>
            <h1 className={styles.title}>Zarejestruj firmę</h1>
            <p className={styles.subtitle}>Podaj dane swojego warsztatu wulkanizacyjnego</p>

            <form onSubmit={handleFirmNext} className={styles.form}>
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
        ) : (
          <>
            <h1 className={styles.title}>Sprawdź dane</h1>
            <p className={styles.subtitle}>Upewnij się, że wszystko się zgadza przed wysłaniem</p>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Firma</span>
                <span className={styles.summaryValue}>{data.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>NIP</span>
                <span className={styles.summaryValue}>{data.nip}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Telefon</span>
                <span className={styles.summaryValue}>{data.phone}</span>
              </div>
              {data.email && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>E-mail</span>
                  <span className={styles.summaryValue}>{data.email}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Adres</span>
                <span className={styles.summaryValue}>
                  {data.street}, {data.postalCode} {data.city}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Województwo</span>
                <span className={styles.summaryValue}>{data.voivodeship}</span>
              </div>
              {data.description && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Opis</span>
                  <span className={styles.summaryValue}>{data.description}</span>
                </div>
              )}
            </div>

            <div className={styles.notice}>
              Po rejestracji firma będzie oczekiwać na weryfikację przez nasz zespół. Zazwyczaj trwa
              to do 24 godzin.
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.actions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={goBack}
                disabled={loading}
              >
                ← Wróć i edytuj
              </button>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Rejestrowanie…' : 'Zarejestruj firmę'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
