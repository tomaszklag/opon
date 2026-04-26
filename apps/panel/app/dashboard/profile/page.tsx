'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProviderForm } from '../../../lib/hooks/use-provider-form';
import { useAuth } from '../../../lib/auth';
import { IconLock } from '../../../components/icons';
import styles from './profile.module.css';

const DESC_MAX = 3000;

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useAuth();
  const { form, provider, loading, saved, apiError, onSubmit, isDirty, isSubmitting } =
    useProviderForm();
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const name = watch('name');
  const logoUrl = watch('logoUrl');
  const description = watch('description');
  const phone = watch('phone');
  const email = watch('email');

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className={styles.page}>
      <div className={styles.actionBar}>
        {isDirty && !saved && <span className={styles.dirtyChip}>Niezapisane zmiany</span>}
        {saved && <span className={styles.savedChip}>Zapisano</span>}
        <button className={styles.saveBtn} onClick={onSubmit} disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Zapisywanie…' : 'Zapisz zmiany'}
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
                  maxLength={200}
                  {...register('name')}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>NIP</span>
                <div className={styles.lockedInput}>
                  <IconLock width="13" height="13" className={styles.lockIco} />
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
                {...register('description')}
              />
              <div className={styles.charCounter}>
                <strong>{(description ?? '').length}</strong> / {DESC_MAX}
              </div>
              {errors.description && (
                <span className={styles.fieldError}>{errors.description.message}</span>
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

          {/* ── Section 3: Lokalizacja ── */}
          <section className={styles.section}>
            <header className={styles.secHead}>
              <h2 className={styles.secTitle}>Lokalizacja</h2>
              <span className={styles.secKicker}>Dane z rejestracji</span>
            </header>

            <div className={styles.metaRow}>
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Lat</span>
                <span className={styles.metaPillVal}>
                  {provider.cityCenterLat != null ? provider.cityCenterLat.toFixed(4) : '—'}
                </span>
              </div>
              <div className={styles.metaPill}>
                <span className={styles.metaPillLabel}>Lng</span>
                <span className={styles.metaPillVal}>
                  {provider.cityCenterLng != null ? provider.cityCenterLng.toFixed(4) : '—'}
                </span>
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
                placeholder="https://example.com/logo.png"
                {...register('logoUrl')}
              />
              {errors.logoUrl ? (
                <span className={styles.fieldError}>{errors.logoUrl.message}</span>
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
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="" className={styles.previewAvatarImg} />
                ) : (
                  <span className={styles.previewAvatarInitials}>
                    {(name ?? '').slice(0, 2).toUpperCase() || 'WW'}
                  </span>
                )}
              </div>
              <div className={styles.previewCardBody}>
                <span className={styles.previewName}>
                  {name || <span className={styles.previewPlaceholder}>Nazwa firmy</span>}
                </span>
                <span className={styles.previewLocation}>
                  {provider.cityCenterLat != null && provider.cityCenterLng != null
                    ? `${provider.cityCenterLat.toFixed(4)}, ${provider.cityCenterLng.toFixed(4)}`
                    : '—'}
                </span>
                {description && (
                  <p className={styles.previewDesc}>
                    {description.length > 120 ? description.slice(0, 120) + '…' : description}
                  </p>
                )}
                <div className={styles.previewContact}>
                  {phone && <span>{phone}</span>}
                  {email && <span>{email}</span>}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
