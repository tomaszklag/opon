'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { StepIndicator, Timeline, Heading, Text } from '@opony/design-system-web';
import type { TimelineEvent } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { getProvider } from '../../../api-data-access/providers';
import { api } from '../../../lib/api';
import type { ProviderPhoto } from '../../../lib/hooks/use-photos-flow';
import {
  IconHourglass,
  IconMail,
  IconMobilePhone,
  IconBriefcase,
  IconCamera,
  IconDisplay,
} from '../../../components/icons';
import styles from './weryfikacja.module.css';

const STEPS = [
  { label: 'Firma', status: 'done' as const },
  { label: 'Zdjęcia', status: 'done' as const },
  { label: 'Weryfikacja', status: 'active' as const },
];

function formatRefNumber(id: string): { part1: string; part2: string } {
  const hex = id.replace(/-/g, '').toUpperCase().substring(0, 8);
  return { part1: hex.substring(0, 4), part2: hex.substring(4, 8) };
}

function formatSubmittedDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  );
}

const PREVIEW_LIMIT = 4;

export default function WeryfikacjaPage() {
  const { isLoading: authLoading } = useAuthGuard('/onboarding/weryfikacja');
  const { data: provider, isLoading: providerLoading } = useSWR('/v1/providers/me', getProvider);
  const { data: photos = [] } = useSWR<ProviderPhoto[]>('/v1/providers/me/photos', (path: string) =>
    api.get<ProviderPhoto[]>(path),
  );

  const isLoading = authLoading || providerLoading;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  const ref = provider ? formatRefNumber(provider.id) : { part1: '----', part2: '----' };

  const submittedDate = provider?.submittedAt
    ? formatSubmittedDate(String(provider.submittedAt))
    : provider?.createdAt
      ? formatSubmittedDate(String(provider.createdAt))
      : '—';

  const timelineEvents: TimelineEvent[] = [
    {
      id: 'submitted',
      label: 'Zgłoszenie wysłane',
      time: submittedDate,
      state: 'done',
    },
    {
      id: 'queued',
      label: 'W kolejce do review',
      time: 'Rozpoczęto · szacowany czas: < 24 h',
      state: 'current',
    },
    {
      id: 'decision',
      label: 'Decyzja zespołu Opony.app',
      time: 'Powiadomienie SMS + email',
      state: 'future',
    },
    {
      id: 'active',
      label: 'Konto aktywne · pierwsza rezerwacja',
      time: 'Zaczniesz przyjmować klientów',
      state: 'future',
    },
  ];

  const previewPhotos = photos.slice(0, PREVIEW_LIMIT);
  const extraCount = Math.max(0, photos.length - PREVIEW_LIMIT);
  const providerType = provider?.type === 'MOBILE' ? 'Mobilny' : 'Stacjonarny';

  return (
    <div className={styles.page}>
      <header className={styles.topStrip}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandWordmark}>
            OPONY
            <span className={styles.brandDot} />
          </span>
          <Text variant="nano" as="span" className={styles.panelTag}>
            PANEL
          </Text>
        </Link>
        <span className={styles.topStripSpacer} />
        <Text variant="body-sm" as="span" color="muted" className={styles.ticketId}>
          <span>Numer zgłoszenia:</span>
          <Text as="strong" variant="kicker" color="primary" weight="bold">
            PRV<span className={styles.ticketHy}>-</span>
            {ref.part1}
            <span className={styles.ticketHy}>-</span>
            {ref.part2}
          </Text>
        </Text>
      </header>

      <div className={styles.stepperBar}>
        <StepIndicator steps={STEPS} />
      </div>

      <div className={styles.formScroll}>
        <div className={styles.formInner}>
          {/* HERO */}
          <section className={styles.hero}>
            <div className={styles.hourglass} aria-hidden="true">
              <IconHourglass width={40} height={40} className={styles.hourglassSvg} />
            </div>
            <Heading variant="hero" as="h1" className={styles.heroTitle}>
              Zgłoszenie wysłane!
            </Heading>
            <Text variant="body-md" as="p" color="secondary" className={styles.heroSub}>
              Sprawdzimy Twoje dane i&nbsp;zdjęcia w&nbsp;ciągu <strong>24 godzin</strong>.
              {provider?.phone && (
                <>
                  {' '}
                  Gdy konto będzie aktywne, dostaniesz SMS na <strong>{provider.phone}</strong>
                </>
              )}
              {provider?.email && (
                <>
                  {' '}
                  oraz email na <strong>{provider.email}</strong>
                </>
              )}
              .
            </Text>
            <div className={styles.etaPill}>
              <span className={styles.etaDot} aria-hidden="true" />
              <Text variant="nano" as="span" color="muted">
                Oczekiwana decyzja
              </Text>
              <Text variant="nano" as="span" color="accent" mono>
                &lt;&nbsp;24&nbsp;h
              </Text>
            </div>
          </section>

          {/* TWO COLUMNS: Timeline + Recap */}
          <div className={styles.twoCol}>
            {/* TIMELINE */}
            <section className={styles.panel} aria-labelledby="sec-timeline">
              <div className={styles.panelHead}>
                <Heading variant="subsection" as="h2" id="sec-timeline">
                  Status weryfikacji
                </Heading>
                <Text variant="nano" as="span" color="muted" mono>
                  4 zdarzenia
                </Text>
              </div>
              <Timeline events={timelineEvents} />
            </section>

            {/* RECAP */}
            <section className={styles.panel} aria-labelledby="sec-recap">
              <div className={styles.panelHead}>
                <Heading variant="subsection" as="h2" id="sec-recap">
                  Co wysłano
                </Heading>
                <Text variant="nano" as="span" color="muted" mono>
                  PRV<span className={styles.ticketHy}>-</span>
                  {ref.part1}
                  <span className={styles.ticketHy}>-</span>
                  {ref.part2}
                </Text>
              </div>

              {provider && (
                <>
                  <div className={styles.recapRow}>
                    <span className={styles.recapIco} aria-hidden="true">
                      <IconBriefcase width={14} height={14} />
                    </span>
                    <div className={styles.recapCol}>
                      <Text variant="nano" as="span" color="muted">
                        Firma
                      </Text>
                      <Text variant="body-sm" as="span" weight="semibold" color="primary">
                        {provider.name}
                      </Text>
                      <Text variant="nano" as="span" color="muted">
                        NIP {provider.nip} · {providerType}
                      </Text>
                    </div>
                  </div>

                  {(provider.phone || provider.email) && (
                    <div className={styles.recapRow}>
                      <span className={styles.recapIco} aria-hidden="true">
                        <IconMobilePhone width={14} height={14} />
                      </span>
                      <div className={styles.recapCol}>
                        <Text variant="nano" as="span" color="muted">
                          Kontakt
                        </Text>
                        {provider.phone && (
                          <Text variant="kicker" as="span" weight="bold" color="primary">
                            {provider.phone}
                          </Text>
                        )}
                        {provider.email && (
                          <Text variant="nano" as="span" color="muted">
                            {provider.email}
                          </Text>
                        )}
                      </div>
                    </div>
                  )}

                  <div className={styles.recapRow}>
                    <span className={styles.recapIco} aria-hidden="true">
                      <IconCamera width={14} height={14} />
                    </span>
                    <div className={styles.recapCol}>
                      <Text variant="nano" as="span" color="muted">
                        Zdjęcia
                      </Text>
                      <Text variant="body-sm" as="span" weight="semibold" color="primary">
                        {photos.length} / 10 przesłanych
                      </Text>
                      {photos.length > 0 && (
                        <div className={styles.photosMini} aria-label="Podgląd zdjęć">
                          {previewPhotos.map((photo) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={photo.id}
                              className={`${styles.photoMini} ${photo.isPrimary ? styles.photoMiniPrimary : ''}`}
                              src={photo.url}
                              alt={photo.originalName}
                            />
                          ))}
                          {extraCount > 0 && (
                            <Text
                              variant="nano"
                              weight="bold"
                              as="span"
                              mono
                              className={styles.photosCount}
                            >
                              +{extraCount}
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* EMAIL NOTICE */}
          {provider?.email && (
            <div className={styles.emailNotice} role="note">
              <span className={styles.emailNoticeIco} aria-hidden="true">
                <IconMail width={14} height={14} />
              </span>
              <Text variant="body-sm" as="p">
                <strong>Wysłaliśmy email</strong> na{' '}
                <Text as="em" weight="bold" color="primary" mono className={styles.mono}>
                  {provider.email}
                </Text>{' '}
                z&nbsp;linkiem weryfikacyjnym — potwierdź adres, żeby nie zwlekać z&nbsp;aktywacją
                konta. Jeśli mail nie przyszedł w&nbsp;ciągu 5 minut, sprawdź spam.
              </Text>
            </div>
          )}

          {/* ACTIONS */}
          <section className={styles.panel} aria-labelledby="sec-actions">
            <div className={styles.panelHead}>
              <Heading variant="subsection" as="h2" id="sec-actions">
                Co możesz zrobić w&nbsp;międzyczasie
              </Heading>
              <Text variant="nano" as="span" className={styles.panelSub}>
                3 działania
              </Text>
            </div>
            <div className={styles.actionsGrid}>
              <button className={`${styles.actionTile} ${styles.actionTilePrimary}`} type="button">
                <div className={styles.actionHead}>
                  <span className={styles.actionIcoPrimary} aria-hidden="true">
                    <IconMail width={15} height={15} />
                  </span>
                  <Text
                    variant="body-sm"
                    as="span"
                    weight="bold"
                    color="accent"
                    className={styles.actionTitle}
                  >
                    Zweryfikuj email
                  </Text>
                  <Text variant="nano" weight="extrabold" as="span" className={styles.actionBadge}>
                    Wymagane
                  </Text>
                </div>
                <Text variant="nano" as="span" color="secondary">
                  Kliknij link w&nbsp;mailu, który wysłaliśmy na {provider?.email ?? 'Twój adres'} —
                  przyspieszy to weryfikację.
                </Text>
              </button>

              <button className={styles.actionTile} type="button">
                <div className={styles.actionHead}>
                  <span className={styles.actionIco} aria-hidden="true">
                    <IconDisplay width={15} height={15} />
                  </span>
                  <Text variant="body-sm" as="span" weight="bold" className={styles.actionTitle}>
                    Przewodnik providera
                  </Text>
                </div>
                <Text variant="nano" as="span" color="secondary">
                  Jak przygotować cennik, godziny, strefę obsługi — wszystko czego się dowiesz
                  w&nbsp;3 minuty.
                </Text>
              </button>

              <button className={styles.actionTile} type="button">
                <div className={styles.actionHead}>
                  <span className={styles.actionIco} aria-hidden="true">
                    <IconMobilePhone width={15} height={15} />
                  </span>
                  <Text variant="body-sm" as="span" weight="bold" className={styles.actionTitle}>
                    Dodaj kontakt
                  </Text>
                </div>
                <Text variant="nano" as="span" color="secondary">
                  Zapisz +48&nbsp;500&nbsp;123&nbsp;456 jako &bdquo;Opony.app&rdquo; — SMSy
                  o&nbsp;rezerwacjach będą przychodzić z&nbsp;tego numeru.
                </Text>
              </button>
            </div>
          </section>

          {/* HELP FOOTER */}
          <div className={styles.helpFoot}>
            <Text variant="body-sm" as="p" color="muted">
              Masz pytania podczas weryfikacji? Napisz na{' '}
              <a href="mailto:pomoc@opony.app" className={styles.helpLink}>
                <strong>pomoc@opony.app</strong>
              </a>{' '}
              lub zadzwoń{' '}
              <a href="tel:+48500123456" className={styles.helpLink}>
                <strong>+48 500 123 456</strong>
              </a>{' '}
              w&nbsp;godz. Pn–Pt 9:00–17:00.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
