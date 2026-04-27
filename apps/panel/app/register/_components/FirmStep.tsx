import { Input, PhoneInput, Button, Spinner } from '@opony/design-system-web';
import {
  IconCheck,
  IconChevronRight,
  IconArrowRight,
  IconPricing,
  IconBriefcase,
  IconLockOutline,
} from '../../../components/icons';
import type { useRegisterFlow } from '../../../lib/hooks/use-register-flow';
import styles from '../register.module.css';

type Flow = ReturnType<typeof useRegisterFlow>;

interface Props {
  flow: Flow;
}

export function FirmStep({ flow }: Props) {
  const {
    data,
    error,
    loading,
    gusData,
    gusLoading,
    gusError,
    setNip,
    setPhone,
    setEmail,
    setIban,
    toggleConsent,
    handleSubmit,
  } = flow;

  function handleConsentKey(
    e: React.KeyboardEvent,
    field: 'consentTerms' | 'consentRodo' | 'consentMarketing',
  ) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleConsent(field);
    }
  }

  const nipSuffix = gusLoading ? (
    <Spinner size="sm" label="Weryfikuję NIP…" />
  ) : gusData ? (
    <IconCheck width={14} height={14} stroke="var(--success)" />
  ) : undefined;

  const ibanPrefix = (
    <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      PL
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.formInner} noValidate>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Zarejestruj warsztat</h1>
        <p className={styles.heroSub}>
          3 kroki, około 5 minut. Weryfikacja do 24 h — potem możesz zacząć przyjmować rezerwacje.
        </p>
        <div className={styles.heroFacts}>
          <span className={styles.factChip}>
            <IconPricing width={11} height={11} />
            0% prowizji w pilocie · później 8%
          </span>
          <span className={styles.factChip}>
            <IconBriefcase width={11} height={11} />
            Rezerwacje online, klient płaci offline
          </span>
          <span className={styles.factChip}>
            <IconLockOutline width={11} height={11} />
            SMS OTP — bez hasła do zapamiętania
          </span>
        </div>
      </div>

      {/* Section 01: Zgody */}
      <section className={styles.section} aria-labelledby="sec-zgody">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} id="sec-zgody">
            Zgody
          </h2>
          <span className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>01</strong> / 03
          </span>
        </div>

        <div className={styles.consentList}>
          {/* Regulamin */}
          <div
            className={`${styles.consentRow} ${styles.consentRowRequired} ${data.consentTerms ? styles.consentRowChecked : ''}`}
            role="checkbox"
            aria-checked={data.consentTerms}
            tabIndex={0}
            onClick={() => toggleConsent('consentTerms')}
            onKeyDown={(e) => handleConsentKey(e, 'consentTerms')}
          >
            <span
              className={`${styles.checkBox} ${data.consentTerms ? styles.checkBoxChecked : ''}`}
            >
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <span className={styles.consentTitle}>Regulamin platformy Opony.app</span>
                <span className={`${styles.consentBadge} ${styles.consentBadgeReq}`}>Wymagane</span>
              </div>
              <p className={styles.consentDesc}>
                <strong style={{ color: 'var(--accent)' }}>
                  0% prowizji w okresie pilotażowym
                </strong>{' '}
                (pierwsze 3 miesiące po uruchomieniu). Później 8% od zrealizowanej rezerwacji.
              </p>
              <a
                className={styles.consentLink}
                href="#"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                Przeczytaj regulamin <IconChevronRight width={8} height={8} />
              </a>
            </div>
          </div>

          {/* RODO */}
          <div
            className={`${styles.consentRow} ${styles.consentRowRequired} ${data.consentRodo ? styles.consentRowChecked : ''}`}
            role="checkbox"
            aria-checked={data.consentRodo}
            tabIndex={0}
            onClick={() => toggleConsent('consentRodo')}
            onKeyDown={(e) => handleConsentKey(e, 'consentRodo')}
          >
            <span
              className={`${styles.checkBox} ${data.consentRodo ? styles.checkBoxChecked : ''}`}
            >
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <span className={styles.consentTitle}>Polityka prywatności (RODO)</span>
                <span className={`${styles.consentBadge} ${styles.consentBadgeReq}`}>Wymagane</span>
              </div>
              <p className={styles.consentDesc}>
                Przetwarzanie danych klientów zgodnie z RODO, retencja, bezpieczeństwo, eksport /
                usunięcie.
              </p>
              <a
                className={styles.consentLink}
                href="#"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
              >
                Przeczytaj politykę <IconChevronRight width={8} height={8} />
              </a>
            </div>
          </div>

          {/* Komunikacja */}
          <div
            className={`${styles.consentRow} ${data.consentMarketing ? styles.consentRowChecked : ''}`}
            role="checkbox"
            aria-checked={data.consentMarketing}
            tabIndex={0}
            onClick={() => toggleConsent('consentMarketing')}
            onKeyDown={(e) => handleConsentKey(e, 'consentMarketing')}
          >
            <span
              className={`${styles.checkBox} ${data.consentMarketing ? styles.checkBoxChecked : ''}`}
            >
              <IconCheck width={13} height={13} stroke="var(--text-on-accent)" />
            </span>
            <div className={styles.consentCol}>
              <div className={styles.consentTitleRow}>
                <span className={styles.consentTitle}>Komunikacja z zespołem Opony.app</span>
                <span className={`${styles.consentBadge} ${styles.consentBadgeOpt}`}>
                  Opcjonalne
                </span>
              </div>
              <p className={styles.consentDesc}>
                Tipsy onboardingowe, nowości platformy, prośby o feedback. Max 1 e-mail / miesiąc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Firma */}
      <section className={styles.section} aria-labelledby="sec-firma">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} id="sec-firma">
            Firma
          </h2>
          <span className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>02</strong> / 03
          </span>
        </div>

        <div>
          <Input
            label="NIP"
            required
            inputMode="numeric"
            value={data.nip}
            onChange={(e) => setNip(e.target.value)}
            placeholder="1234567890"
            success={!!gusData}
            suffix={nipSuffix}
            error={gusError || undefined}
            hint="10 cyfr bez myślników. Dane firmy zostaną pobrane automatycznie z GUS / CEIDG."
            className={styles.mono}
          />
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

      {/* Section 03: Kontakt i wypłaty */}
      <section className={styles.section} aria-labelledby="sec-kontakt">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle} id="sec-kontakt">
            Kontakt i wypłaty
          </h2>
          <span className={styles.sectionNumber}>
            <strong className={styles.sectionNumberAccent}>03</strong> / 03
          </span>
        </div>

        <div className={styles.fieldGrid2}>
          <PhoneInput
            label="Telefon"
            required
            value={data.phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="501 234 789"
            hint="Używany do logowania (SMS OTP) i powiadomień o rezerwacjach."
          />
          <Input
            label="Email"
            type="email"
            required
            value={data.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kontakt@firma.pl"
            hint="Wyślemy link weryfikacyjny. Raport tygodniowy + faktury."
          />
        </div>

        <Input
          label="Numer konta (IBAN)"
          inputMode="numeric"
          value={data.iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="12 3456 7890 1234 5678 9012 3456"
          prefix={ibanPrefix}
          hint="W pilotażu apka jest darmowa (0% prowizji) — klient płaci Tobie offline. IBAN wykorzystamy gdy uruchomimy rozliczenia online (planowane v0.5)."
          maxLength={26}
          className={styles.mono}
        />
      </section>

      {/* Error */}
      {error && <p className={styles.error}>{error}</p>}

      {/* CTA */}
      <div className={styles.ctaRow}>
        <p className={styles.ctaNote}>
          Po kliknięciu &bdquo;Dalej&rdquo; zapiszemy dane firmy. Na podany e-mail wyślemy link
          weryfikacyjny, a na numer telefonu — kod SMS do logowania.
        </p>
        <Button type="submit" variant="primary" loading={loading} className={styles.ctaBtn}>
          Dalej
          <IconArrowRight width={16} height={16} />
          <span className={styles.ctaBtnNext}>Zdjęcia</span>
        </Button>
      </div>

      {/* Help foot */}
      <div className={styles.helpFoot}>
        Problem z NIP-em? GUS nie odpowiada? Napisz na{' '}
        <a href="mailto:pomoc@opony.app">pomoc@opony.app</a> — odpowiemy w 2 godziny.
      </div>
    </form>
  );
}
