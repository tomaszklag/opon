import { Controller } from 'react-hook-form';
import {
  Input,
  PhoneInput,
  Button,
  Spinner,
  NoticeBlock,
  Heading,
  Text,
} from '@opony/design-system-web';
import {
  IconCheck,
  IconChevronRight,
  IconArrowRight,
  IconPricing,
  IconBriefcase,
  IconLockOutline,
  IconRefresh,
} from '../../../components/icons';
import type { useRegisterFlow } from '../../../lib/hooks/use-register-flow';
import styles from '../register.module.css';

type Flow = ReturnType<typeof useRegisterFlow>;

interface Props {
  flow: Flow;
}

export function FirmStep({ flow }: Props) {
  const {
    form,
    apiError,
    gusData,
    gusLoading,
    gusError,
    gusErrorCode,
    retry,
    toggleConsent,
    handleSubmit,
  } = flow;
  const {
    control,
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const consentTerms = watch('consentTerms');
  const consentRodo = watch('consentRodo');
  const consentMarketing = watch('consentMarketing');

  function handleConsentKey(
    e: React.KeyboardEvent,
    field: 'consentTerms' | 'consentRodo' | 'consentMarketing',
  ) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleConsent(field);
    }
  }

  const isRetryableError =
    gusErrorCode === 'GUS_CONNECTION_ERROR' || gusErrorCode === 'GUS_REQUEST_ERROR';

  const nipSuffix = gusLoading ? (
    <Spinner size="sm" label="Weryfikuję NIP…" />
  ) : gusData ? (
    <IconCheck width={14} height={14} stroke="var(--success)" />
  ) : gusError ? (
    <button
      type="button"
      onClick={retry}
      title="Spróbuj ponownie"
      aria-label="Spróbuj ponownie"
      className={styles.retryBtn}
    >
      <IconRefresh width={14} height={14} />
    </button>
  ) : undefined;

  return (
    <form onSubmit={handleSubmit} className={styles.formInner} noValidate>
      {/* Hero */}
      <div className={styles.hero}>
        <Heading variant="hero" as="h1" className={styles.heroTitle}>
          Zarejestruj warsztat
        </Heading>
        <Text variant="body-md" as="p" className={styles.heroSub}>
          3 kroki, około 5 minut. Weryfikacja do 24 h — potem możesz zacząć przyjmować rezerwacje.
        </Text>
        <div className={styles.heroFacts}>
          <Text variant="label" as="span" className={styles.factChip}>
            <IconPricing width={11} height={11} />
            0% prowizji w pilocie · później 8%
          </Text>
          <Text variant="label" as="span" className={styles.factChip}>
            <IconBriefcase width={11} height={11} />
            Rezerwacje online, klient płaci offline
          </Text>
          <Text variant="label" as="span" className={styles.factChip}>
            <IconLockOutline width={11} height={11} />
            SMS OTP — bez hasła do zapamiętania
          </Text>
        </div>
      </div>

      {/* Section 01: Zgody */}
      <section className={styles.section} aria-labelledby="sec-zgody">
        <div className={styles.sectionHead}>
          <Heading variant="section" as="h2" id="sec-zgody" className={styles.sectionTitle}>
            Zgody
          </Heading>
          <Text variant="kicker" as="span" className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>01</strong> / 03
          </Text>
        </div>

        <div className={styles.consentList}>
          {/* Regulamin */}
          <div
            className={`${styles.consentRow} ${styles.consentRowRequired} ${consentTerms ? styles.consentRowChecked : ''} ${errors.consentTerms ? styles.consentRowError : ''}`}
            role="checkbox"
            aria-checked={consentTerms}
            tabIndex={0}
            onClick={() => toggleConsent('consentTerms')}
            onKeyDown={(e) => handleConsentKey(e, 'consentTerms')}
          >
            <span className={`${styles.checkBox} ${consentTerms ? styles.checkBoxChecked : ''}`}>
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <Text variant="body-sm" as="span" weight="bold" className={styles.consentTitle}>
                  Regulamin platformy Opony.app
                  <span className={styles.consentReqStar} aria-hidden="true">
                    *
                  </span>
                </Text>
              </div>
              <Text variant="body-sm" as="p" className={styles.consentDesc}>
                <strong style={{ color: 'var(--accent)' }}>
                  0% prowizji w okresie pilotażowym
                </strong>{' '}
                (pierwsze 3 miesiące po uruchomieniu). Później 8% od zrealizowanej rezerwacji.
              </Text>
              <a
                className={styles.consentLink}
                href="#"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                Przeczytaj regulamin <IconChevronRight width={8} height={8} />
              </a>
              {errors.consentTerms && (
                <span className={styles.consentFieldError}>{errors.consentTerms.message}</span>
              )}
            </div>
          </div>

          {/* RODO */}
          <div
            className={`${styles.consentRow} ${styles.consentRowRequired} ${consentRodo ? styles.consentRowChecked : ''} ${errors.consentRodo ? styles.consentRowError : ''}`}
            role="checkbox"
            aria-checked={consentRodo}
            tabIndex={0}
            onClick={() => toggleConsent('consentRodo')}
            onKeyDown={(e) => handleConsentKey(e, 'consentRodo')}
          >
            <span className={`${styles.checkBox} ${consentRodo ? styles.checkBoxChecked : ''}`}>
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <Text variant="body-sm" as="span" weight="bold" className={styles.consentTitle}>
                  Polityka prywatności (RODO)
                  <span className={styles.consentReqStar} aria-hidden="true">
                    *
                  </span>
                </Text>
              </div>
              <Text variant="body-sm" as="p" className={styles.consentDesc}>
                Przetwarzanie danych klientów zgodnie z RODO, retencja, bezpieczeństwo, eksport /
                usunięcie.
              </Text>
              <a
                className={styles.consentLink}
                href="#"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                Przeczytaj politykę <IconChevronRight width={8} height={8} />
              </a>
              {errors.consentRodo && (
                <span className={styles.consentFieldError}>{errors.consentRodo.message}</span>
              )}
            </div>
          </div>

          {/* Komunikacja */}
          <div
            className={`${styles.consentRow} ${consentMarketing ? styles.consentRowChecked : ''}`}
            role="checkbox"
            aria-checked={consentMarketing}
            tabIndex={0}
            onClick={() => toggleConsent('consentMarketing')}
            onKeyDown={(e) => handleConsentKey(e, 'consentMarketing')}
          >
            <span
              className={`${styles.checkBox} ${consentMarketing ? styles.checkBoxChecked : ''}`}
            >
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <Text variant="body-sm" as="span" weight="bold" className={styles.consentTitle}>
                  Komunikacja z zespołem Opony.app
                </Text>
                <Text
                  variant="nano"
                  as="span"
                  className={`${styles.consentBadge} ${styles.consentBadgeOpt}`}
                >
                  Opcjonalne
                </Text>
              </div>
              <Text variant="body-sm" as="p" className={styles.consentDesc}>
                Tipsy onboardingowe, nowości platformy, prośby o feedback. Max 1 e-mail / miesiąc.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Firma */}
      <section className={styles.section} aria-labelledby="sec-firma">
        <div className={styles.sectionHead}>
          <Heading variant="section" as="h2" id="sec-firma" className={styles.sectionTitle}>
            Firma
          </Heading>
          <Text variant="kicker" as="span" className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>02</strong> / 03
          </Text>
        </div>

        <div>
          <Controller
            name="nip"
            control={control}
            render={({ field, fieldState }) => (
              <Input
                label="NIP"
                required
                inputMode="numeric"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onBlur={field.onBlur}
                placeholder="1234567890"
                success={!!gusData}
                suffix={nipSuffix}
                error={fieldState.error?.message || gusError || undefined}
                hint={
                  field.value.length < 10
                    ? '10 cyfr bez myślników. Dane firmy zostaną pobrane automatycznie z GUS / CEIDG.'
                    : undefined
                }
                className={styles.mono}
              />
            )}
          />
          {gusError && isRetryableError && (
            <NoticeBlock variant="warning">
              <Text variant="body-sm" as="span">
                {gusError}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={retry}
                style={{ marginTop: 8 }}
              >
                <IconRefresh width={14} height={14} />
                Spróbuj ponownie
              </Button>
            </NoticeBlock>
          )}
          {gusData && (
            <div className={styles.gusResult} role="region" aria-label="Dane z GUS">
              <div className={styles.gusHead}>
                <span className={styles.gusBadge}>GUS ✓</span>
                Dane pobrane z rejestru CEIDG
              </div>
              <div className={styles.gusFields}>
                <span className={styles.gusLabel}>Nazwa</span>
                <span className={styles.gusValue}>{gusData.name}</span>
                <span className={styles.gusLabel}>Adres</span>
                <span className={styles.gusValue}>{gusData.address}</span>
                <span className={styles.gusLabel}>Forma</span>
                <span className={styles.gusPills}>
                  {gusData.type && <span className={styles.gusPill}>{gusData.type}</span>}
                  {gusData.pkd && <span className={styles.gusPill}>{gusData.pkd}</span>}
                  {gusData.status && <span className={styles.gusPill}>{gusData.status}</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 03: Kontakt */}
      <section className={styles.section} aria-labelledby="sec-kontakt">
        <div className={styles.sectionHead}>
          <Heading variant="section" as="h2" id="sec-kontakt" className={styles.sectionTitle}>
            Kontakt
          </Heading>
          <Text variant="kicker" as="span" className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>03</strong> / 03
          </Text>
        </div>

        <div className={styles.fieldGrid2}>
          <Controller
            name="phone"
            control={control}
            render={({ field, fieldState }) => (
              <PhoneInput
                label="Telefon"
                required
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                placeholder="501 234 789"
                hint="Używany do logowania (SMS OTP) i powiadomień o rezerwacjach."
              />
            )}
          />
          <Input
            label="Email"
            type="email"
            required
            {...register('email')}
            error={errors.email?.message}
            placeholder="kontakt@firma.pl"
            hint="Wyślemy link weryfikacyjny. Raport tygodniowy + faktury."
          />
        </div>
      </section>

      {/* API error */}
      {apiError && <NoticeBlock variant="danger">{apiError}</NoticeBlock>}

      {/* CTA */}
      <div className={styles.ctaRow}>
        <Text variant="body" as="p" className={styles.ctaNote}>
          Po kliknięciu &bdquo;Dalej&rdquo; zapiszemy dane firmy. Na podany e-mail wyślemy link
          weryfikacyjny, a na numer telefonu — kod SMS do logowania.
        </Text>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
          Dalej
          <IconArrowRight width={16} height={16} />
          <span className={styles.ctaBtnNext}>Zdjęcia</span>
        </Button>
      </div>

      {/* Help foot */}
      <Text variant="body-sm" as="p" className={styles.helpFoot}>
        Problem z NIP-em? GUS nie odpowiada? Napisz na{' '}
        <a href="mailto:pomoc@opony.app">pomoc@opony.app</a> — odpowiemy w 2 godziny.
      </Text>
    </form>
  );
}
