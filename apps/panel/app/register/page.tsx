'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import styles from './register.module.css';

type Step = 'firm' | 'confirm';

interface FirmData {
  name: string;
  nip: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  voivodeship: string;
  description: string;
}

const EMPTY: FirmData = {
  name: '',
  nip: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  postalCode: '',
  voivodeship: '',
  description: '',
};

const VOIVODESHIPS = [
  'dolnośląskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'łódzkie',
  'małopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'śląskie',
  'świętokrzyskie',
  'warmińsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
];

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [step, setStep] = useState<Step>('firm');
  const [data, setData] = useState<FirmData>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof FirmData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setData((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleFirmNext(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('confirm');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/providers', {
        name: data.name,
        nip: data.nip,
        phone: data.phone,
        email: data.email || undefined,
        address: {
          street: data.street,
          city: data.city,
          postalCode: data.postalCode,
          voivodeship: data.voivodeship,
        },
        description: data.description || undefined,
      });
      await refresh();
      router.replace('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.isConflict) {
        setError('Firma z tym NIPem już istnieje w systemie.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Błąd rejestracji. Spróbuj ponownie.');
      }
      setStep('firm');
    } finally {
      setLoading(false);
    }
  }

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
                    onChange={set('name')}
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
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        nip: e.target.value.replace(/\D/g, '').slice(0, 10),
                      }))
                    }
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
                    onChange={set('phone')}
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
                    onChange={set('email')}
                    placeholder="kontakt@firma.pl"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Ulica i numer *</label>
                <input
                  className={styles.input}
                  value={data.street}
                  onChange={set('street')}
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
                    onChange={set('city')}
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
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d-]/g, '').slice(0, 6);
                      setData((p) => ({ ...p, postalCode: v }));
                    }}
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
                  onChange={set('voivodeship')}
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
                  onChange={set('description')}
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
                onClick={() => setStep('firm')}
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
