'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import styles from './profile.module.css';

type Provider = {
  id: string;
  name: string;
  nip: string;
  status: string;
  city: string;
  voivodeship: string;
  phone: string;
  email: string | null;
  description: string | null;
  logoUrl: string | null;
  serviceRadiusKm: number | null;
};

type FormState = {
  name: string;
  description: string;
  phone: string;
  email: string;
  logoUrl: string;
};

const PHONE_RE = /^\+\d{7,15}$/;
const DESC_MAX = 3000;
const NAME_MAX = 200;

function providerToForm(p: Provider): FormState {
  return {
    name: p.name,
    description: p.description ?? '',
    phone: p.phone,
    email: p.email ?? '',
    logoUrl: p.logoUrl ?? '',
  };
}

function isDirty(form: FormState, original: FormState): boolean {
  return (Object.keys(form) as (keyof FormState)[]).some((k) => form[k] !== original[k]);
}

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    phone: '',
    email: '',
    logoUrl: '',
  });
  const [original, setOriginal] = useState<FormState>({
    name: '',
    description: '',
    phone: '',
    email: '',
    logoUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    api
      .get<Provider>('/v1/providers/me')
      .then((p) => {
        setProvider(p);
        const f = providerToForm(p);
        setForm(f);
        setOriginal(f);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  function patch(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSaved(false);
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) errs.name = 'Nazwa jest wymagana';
    else if (form.name.length > NAME_MAX) errs.name = `Maksymalnie ${NAME_MAX} znaków`;
    if (form.description.length > DESC_MAX) errs.description = `Maksymalnie ${DESC_MAX} znaków`;
    if (form.phone && !PHONE_RE.test(form.phone))
      errs.phone = 'Format: +48600000000 (+ i 7–15 cyfr)';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Nieprawidłowy adres e-mail';
    if (form.logoUrl && !/^https?:\/\/.+/.test(form.logoUrl))
      errs.logoUrl = 'Podaj pełny URL (https://...)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setApiError(null);
    setSaving(true);
    try {
      const updated = await api.patch<Provider>('/v1/providers/me', {
        name: form.name.trim(),
        description: form.description || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      setProvider(updated);
      const f = providerToForm(updated);
      setForm(f);
      setOriginal(f);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      if (err instanceof ApiError) setApiError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  const dirty = isDirty(form, original);

  return (
    <div className={styles.page}>
      <div className={styles.actionBar}>
        {dirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
        {saved && <span className={styles.savedChip}>Zapisano</span>}
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || !dirty}>
          {saving ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>Profil firmy</h1>
            <p className={styles.pageSub}>
              Dane widoczne publicznie w wynikach wyszukiwania i na karcie warsztatu.
            </p>
          </header>

          {apiError && <div className={styles.apiError}>{apiError}</div>}

          {/* ── Section 1: Tożsamość ── */}
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
                  value={form.name}
                  maxLength={NAME_MAX}
                  onChange={(e) => patch('name', e.target.value)}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>NIP</span>
                <div className={styles.lockedInput}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                    className={styles.lockIco}
                  >
                    <path d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7h.5a1 1 0 0 1 1 1v5.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h.5Zm1.5 0h4V5.5a2 2 0 0 0-4 0V7Z" />
                  </svg>
                  <span className={styles.lockedVal}>{provider.nip}</span>
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
                value={form.description}
                onChange={(e) => patch('description', e.target.value)}
              />
              <div className={styles.charCounter}>
                <strong>{form.description.length}</strong> / {DESC_MAX}
              </div>
              {errors.description && (
                <span className={styles.fieldError}>{errors.description}</span>
              )}
            </div>
          </section>

          {/* ── Section 2: Kontakt ── */}
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
                  value={form.phone}
                  placeholder="+48600000000"
                  onChange={(e) => patch('phone', e.target.value)}
                />
                {errors.phone ? (
                  <span className={styles.fieldError}>{errors.phone}</span>
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
                  value={form.email}
                  placeholder="kontakt@firma.pl"
                  onChange={(e) => patch('email', e.target.value)}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>
            </div>
          </section>

          {/* ── Section 3: Lokalizacja ── */}
          <section className={styles.section}>
            <header className={styles.secHead}>
              <h2 className={styles.secTitle}>Lokalizacja</h2>
              <span className={styles.secKicker}>Dane z rejestracji</span>
            </header>

            <div className={styles.metaRow}>
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Miasto</span>
                <span className={styles.metaPillVal}>{provider.city}</span>
              </div>
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Województwo</span>
                <span className={styles.metaPillVal}>{provider.voivodeship}</span>
              </div>
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Status konta</span>
                <span className={styles.metaPillVal}>{provider.status}</span>
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
                value={form.logoUrl}
                placeholder="https://example.com/logo.png"
                onChange={(e) => patch('logoUrl', e.target.value)}
              />
              {errors.logoUrl ? (
                <span className={styles.fieldError}>{errors.logoUrl}</span>
              ) : (
                <span className={styles.fieldHint}>
                  Publiczny URL obrazka PNG/JPG, min 200×200 px
                </span>
              )}
            </div>
          </section>
        </div>

        {/* ── Right: preview ── */}
        <aside className={styles.previewCol}>
          <div className={styles.previewPanel}>
            <div className={styles.previewHead}>
              <span className={styles.previewTitle}>Podgląd karty</span>
              <span className={styles.previewSub}>jak widzi klient</span>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewAvatar}>
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="" className={styles.previewAvatarImg} />
                ) : (
                  <span className={styles.previewAvatarInitials}>
                    {form.name.slice(0, 2).toUpperCase() || 'WW'}
                  </span>
                )}
              </div>
              <div className={styles.previewCardBody}>
                <span className={styles.previewName}>
                  {form.name || <span className={styles.previewPlaceholder}>Nazwa firmy</span>}
                </span>
                <span className={styles.previewLocation}>
                  {provider.city}, {provider.voivodeship}
                </span>
                {form.description && (
                  <p className={styles.previewDesc}>
                    {form.description.length > 120
                      ? form.description.slice(0, 120) + '…'
                      : form.description}
                  </p>
                )}
                <div className={styles.previewContact}>
                  {form.phone && <span>{form.phone}</span>}
                  {form.email && <span>{form.email}</span>}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
