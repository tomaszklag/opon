'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Heading,
  Text,
  Input,
  Textarea,
  Chip,
  Toggle,
  Button,
  Spinner,
} from '@opony/design-system-web';
import { useProfile, usePhotos } from '../../../lib/hooks/use-profile';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import {
  profileApi,
  type ProviderProfileDto,
  type ProviderPhotoDto,
} from '../../../api-data-access/profile';
import { AutosavePill } from './_components/AutosavePill';
import { TypeCard } from './_components/TypeCard';
import {
  IconLock,
  IconTrash,
  IconCamera,
  IconEye,
  IconPublish,
  IconCar,
  IconTruck,
  IconBothWays,
  IconStar,
  IconPhone,
} from '../../../components/icons';
import styles from './profile.module.css';

// ── Constants ────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  { key: 'PASSENGER', label: 'Osobowe' },
  { key: 'CARGO_35T', label: 'Dostawcze do 3,5 t' },
  { key: 'SUV', label: 'SUV / 4×4' },
  { key: 'MOTORCYCLE', label: 'Motocykle' },
  { key: 'HEAVY', label: 'Ciężarowe > 3,5 t' },
];

const TIRE_SIZES = [
  { key: 'S15', label: '≤ 15"' },
  { key: 'S16_17', label: '16" — 17"' },
  { key: 'S18', label: '≥ 18"' },
  { key: 'S21_RUNFLAT', label: '≥ 21" (run-flat)' },
];

const ADDITIONAL_SERVICES = [
  { key: 'BALANCING', label: 'Wyważanie' },
  { key: 'SEASONAL_SWAP', label: 'Sezonowa wymiana' },
  { key: 'PUNCTURE_REPAIR', label: 'Naprawa bieżnika' },
  { key: 'TPMS', label: 'TPMS (czujniki)' },
  { key: 'ALIGNMENT', label: 'Geometria' },
  { key: 'TIRE_HOTEL', label: 'Hotel opon' },
];

const DESC_MAX = 500;
const TAGLINE_MAX = 60;

// ── Form state type ───────────────────────────────────────────────────────────

interface ProfileFormState {
  name: string;
  type: 'MOBILE' | 'STATIONARY' | 'BOTH';
  description: string;
  tagline: string;
  foundedYear: string;
  showPhone: boolean;
  address: string;
  phone: string;
  vehicleTypes: string[];
  tireSizes: string[];
  additionalServices: string[];
}

function profileToForm(p: ProviderProfileDto): ProfileFormState {
  return {
    name: p.name,
    type: p.type,
    description: p.description ?? '',
    tagline: p.tagline ?? '',
    foundedYear: p.foundedYear != null ? String(p.foundedYear) : '',
    showPhone: p.showPhone,
    address: p.address ?? '',
    phone: p.phone ?? '',
    vehicleTypes: p.vehicleTypes ?? [],
    tireSizes: p.tireSizes ?? [],
    additionalServices: p.additionalServices ?? [],
  };
}

// ── Phone preview ─────────────────────────────────────────────────────────────

function PhonePreview({ form, photos }: { form: ProfileFormState; photos: ProviderPhotoDto[] }) {
  const allTags = [
    ...form.vehicleTypes.map((k) => VEHICLE_TYPES.find((v) => v.key === k)?.label ?? k),
    ...form.tireSizes.map((k) => TIRE_SIZES.find((t) => t.key === k)?.label ?? k),
  ].slice(0, 6);

  const heroPhoto = photos.find((p) => p.isPrimary) ?? photos[0];

  return (
    <aside className={styles.previewCol} aria-label="Podgląd publiczny">
      <div className={styles.previewHead}>
        <Heading variant="subsection" as="h3">
          Podgląd
        </Heading>
        <div className={styles.previewToolbar} role="tablist" aria-label="Tryb podglądu">
          <button
            className={`${styles.previewTab} ${styles.previewTabActive}`}
            role="tab"
            aria-selected={true}
            type="button"
          >
            Mobile
          </button>
          <button className={styles.previewTab} role="tab" aria-selected={false} type="button">
            Web
          </button>
        </div>
      </div>

      <div className={styles.phonePreview}>
        <div className={styles.phoneMockup}>
          <div className={styles.phoneStatus}>
            <Text variant="nano" as="span" mono weight="bold">
              09:41
            </Text>
          </div>

          <div className={styles.phoneHero} aria-hidden="true">
            {heroPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPhoto.url} alt="" className={styles.phoneHeroImg} />
            )}
            <div className={styles.phoneDots} aria-hidden="true">
              <span className={`${styles.phoneDot} ${styles.phoneDotActive}`} />
              <span className={styles.phoneDot} />
              <span className={styles.phoneDot} />
            </div>
          </div>

          <div className={styles.phoneBody}>
            <div className={styles.ppNameRow}>
              <span className={styles.ppName}>
                {form.name ? form.name.toUpperCase() : 'NAZWA WARSZTATU'}
              </span>
              <span className={styles.ppBadge}>PRO</span>
            </div>

            <div className={styles.ppMetaRow}>
              <span className={styles.ppRating}>
                <IconStar width="10" height="10" className={styles.ppStarIco} />
                <Text variant="nano" as="span" mono weight="bold">
                  {' '}
                  4,8{' '}
                </Text>
                <Text variant="nano" as="span" color="muted">
                  (127)
                </Text>
              </span>
              <span className={styles.ppDotSep} aria-hidden="true" />
              {form.address && (
                <Text variant="nano" as="span" color="secondary">
                  {form.address.split(',')[0]}
                </Text>
              )}
            </div>

            {allTags.length > 0 && (
              <div className={styles.ppTagRow}>
                {allTags.map((tag) => (
                  <span key={tag} className={styles.ppTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {form.description && (
              <Text variant="caption" as="p" color="secondary" className={styles.ppDesc}>
                {form.description.length > 160
                  ? form.description.slice(0, 160) + '…'
                  : form.description}
              </Text>
            )}

            <div className={styles.ppCtaRow}>
              <div className={styles.ppCtaPrimary}>WYBIERZ TERMIN</div>
              {form.showPhone && form.phone && (
                <div className={styles.ppCtaGhost} aria-label="Zadzwoń">
                  <IconPhone width="14" height="14" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.previewCaption}>
            <Text variant="nano" as="span" mono color="muted">
              Tak widzi profil klient ·{' '}
            </Text>
            <Text variant="nano" as="span" mono color="accent" weight="bold">
              aktualizuje się na żywo
            </Text>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { profile, isLoading: profileLoading, revalidate } = useProfile();
  const { photos, isLoading: photosLoading, revalidate: revalidatePhotos } = usePhotos();

  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPatchRef = useRef<Partial<ProviderProfileDto>>({});

  // Initialize form from loaded profile (once)
  if (profile && form === null) {
    setForm(profileToForm(profile));
  }

  const scheduleSave = useCallback(
    (patch: Partial<ProviderProfileDto>) => {
      pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveState('saving');
      saveTimerRef.current = setTimeout(async () => {
        const toSave = pendingPatchRef.current;
        pendingPatchRef.current = {};
        try {
          await profileApi.patch(toSave);
          setLastSavedAt(new Date());
          setSaveState('saved');
          void revalidate();
        } catch {
          setSaveState('idle');
        }
      }, 1500);
    },
    [revalidate],
  );

  function updateField<K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

    // Map form field → DTO field for PATCH
    if (key === 'foundedYear') {
      const num = Number(value as string);
      if (!isNaN(num) && (value as string).length === 4) {
        scheduleSave({ foundedYear: num });
      }
      return;
    }
    scheduleSave({ [key]: value } as Partial<ProviderProfileDto>);
  }

  function toggleArrayItem(
    key: 'vehicleTypes' | 'tireSizes' | 'additionalServices',
    itemKey: string,
  ) {
    if (!form) return;
    const current = form[key] as string[];
    const next = current.includes(itemKey)
      ? current.filter((k) => k !== itemKey)
      : [...current, itemKey];
    updateField(key, next as ProfileFormState[typeof key]);
  }

  async function handleDeletePhoto(id: string) {
    try {
      await profileApi.deletePhoto(id);
      void revalidatePhotos();
    } catch {
      // silently fail
    }
  }

  async function handlePublish() {
    if (!form) return;
    // Force-save immediately
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const patch = pendingPatchRef.current;
    pendingPatchRef.current = {};
    if (Object.keys(patch).length > 0) {
      setSaveState('saving');
      try {
        await profileApi.patch(patch);
        setLastSavedAt(new Date());
        setSaveState('saved');
        void revalidate();
      } catch {
        setSaveState('idle');
      }
    }
  }

  if (authLoading || profileLoading || photosLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie profilu…" />
      </div>
    );
  }

  if (!profile || !form) return null;

  const selectedCount =
    form.vehicleTypes.length + form.tireSizes.length + form.additionalServices.length;

  return (
    <div className={styles.page}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.topbarBreadcrumb}>
          <Text variant="caption" as="span" color="muted" weight="semibold">
            Firma
          </Text>
          <Text variant="caption" as="span" color="muted">
            ›
          </Text>
          <Text variant="caption" as="span" weight="bold">
            Profil warsztatu
          </Text>
        </div>
        <div className={styles.topbarSpacer} />
        <div className={styles.topbarActions}>
          <AutosavePill state={saveState} savedAt={lastSavedAt} />
          <Button variant="ghost" size="sm">
            <IconEye width="13" height="13" />
            Podgląd publiczny
          </Button>
          <Button variant="primary" size="sm" onClick={handlePublish}>
            <IconPublish width="13" height="13" />
            Opublikuj zmiany
          </Button>
        </div>
      </div>

      {/* Content split */}
      <div className={styles.contentSplit}>
        {/* Form column */}
        <div className={styles.formCol}>
          {/* Section: Tożsamość firmy */}
          <section className={styles.section} aria-labelledby="sec-identity">
            <header className={styles.secHead}>
              <Heading variant="subsection" as="h2" id="sec-identity">
                Tożsamość firmy
              </Heading>
              <span className={styles.secHint}>
                <Text variant="nano" as="span" color="muted">
                  Pola{' '}
                  <Text variant="nano" as="span" color="accent" weight="bold">
                    *
                  </Text>{' '}
                  są wymagane
                </Text>
              </span>
            </header>

            <div className={styles.fieldRow3}>
              <Input
                label="Nazwa wyświetlana *"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                maxLength={200}
              />

              <div className={styles.field}>
                <Text variant="label" as="span" color="muted">
                  NIP
                </Text>
                <div className={styles.lockedField}>
                  <IconLock width="13" height="13" className={styles.lockedFieldIco} />
                  <Text variant="kicker" as="span" weight="bold" className={styles.lockedFieldVal}>
                    {profile.nip}
                  </Text>
                  <Text
                    variant="nano"
                    as="span"
                    mono
                    weight="bold"
                    color="muted"
                    className={styles.lockedFieldTag}
                  >
                    GUS · OK
                  </Text>
                </div>
              </div>

              <div className={styles.field}>
                <Text variant="label" as="span" color="muted">
                  Nr wpisu CEIDG
                </Text>
                <div className={styles.lockedField}>
                  <IconLock width="13" height="13" className={styles.lockedFieldIco} />
                  <Text variant="kicker" as="span" weight="bold" className={styles.lockedFieldVal}>
                    —
                  </Text>
                  <Text
                    variant="nano"
                    as="span"
                    mono
                    weight="bold"
                    color="muted"
                    className={styles.lockedFieldTag}
                  >
                    Zaakceptowano
                  </Text>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <Textarea
                label="Opis warsztatu *"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                maxLength={DESC_MAX}
              />
              <div className={styles.charCounter}>
                <Text
                  variant="nano"
                  as="span"
                  mono
                  color={form.description.length > DESC_MAX ? 'accent' : 'muted'}
                >
                  <Text variant="nano" as="span" mono weight="bold" color="secondary">
                    {form.description.length}
                  </Text>
                  {' / '}
                  {DESC_MAX} znaków
                </Text>
              </div>
            </div>

            <div className={styles.fieldRow2}>
              <div className={styles.field}>
                <Input
                  label="Tagline (krótki opis)"
                  value={form.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  maxLength={TAGLINE_MAX}
                />
                <Text variant="nano" as="span" color="muted" className={styles.fieldHint}>
                  Max {TAGLINE_MAX} znaków. Pokazujemy na karcie w wynikach.
                </Text>
              </div>

              <Input
                label="Działalność od"
                value={form.foundedYear}
                onChange={(e) => updateField('foundedYear', e.target.value)}
                maxLength={4}
                placeholder="np. 2019"
              />
            </div>
          </section>

          {/* Section: Typ serwisu */}
          <section className={styles.section} aria-labelledby="sec-type">
            <header className={styles.secHead}>
              <Heading variant="subsection" as="h2" id="sec-type">
                Typ serwisu
              </Heading>
            </header>

            <div className={styles.typeGrid}>
              <TypeCard
                value="STATIONARY"
                label="Stacjonarny"
                description="Klient przyjeżdża pod adres warsztatu."
                icon={<IconCar width="16" height="16" />}
                selected={form.type === 'STATIONARY'}
                onSelect={() => updateField('type', 'STATIONARY')}
              />
              <TypeCard
                value="MOBILE"
                label="Mobilny"
                description="Dojazd do klienta w ustalonej strefie."
                icon={<IconTruck width="16" height="16" />}
                selected={form.type === 'MOBILE'}
                onSelect={() => updateField('type', 'MOBILE')}
              />
              <TypeCard
                value="BOTH"
                label="Stacjonarny + mobilny"
                description="Obsługujesz w warsztacie i z dojazdem."
                icon={<IconBothWays width="16" height="16" />}
                selected={form.type === 'BOTH'}
                onSelect={() => updateField('type', 'BOTH')}
              />
            </div>
          </section>

          {/* Section: Zakres usług */}
          <section className={styles.section} aria-labelledby="sec-services">
            <header className={styles.secHead}>
              <Heading variant="subsection" as="h2" id="sec-services">
                Zakres usług
              </Heading>
              <span className={styles.secHint}>
                <Text variant="nano" as="span" mono weight="bold" color="secondary">
                  {selectedCount}
                </Text>
                <Text variant="nano" as="span" color="muted">
                  {' '}
                  wybrano
                </Text>
              </span>
            </header>

            <div className={styles.field}>
              <Text variant="label" as="span" color="muted">
                Typ pojazdu
              </Text>
              <div className={styles.chipRow}>
                {VEHICLE_TYPES.map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={form.vehicleTypes.includes(key)}
                    onSelect={() => toggleArrayItem('vehicleTypes', key)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <Text variant="label" as="span" color="muted">
                Rozmiary opon
              </Text>
              <div className={styles.chipRow}>
                {TIRE_SIZES.map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={form.tireSizes.includes(key)}
                    onSelect={() => toggleArrayItem('tireSizes', key)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <Text variant="label" as="span" color="muted">
                Dodatkowe usługi
              </Text>
              <div className={styles.chipRow}>
                {ADDITIONAL_SERVICES.map(({ key, label }) => (
                  <Chip
                    key={key}
                    label={label}
                    selected={form.additionalServices.includes(key)}
                    onSelect={() => toggleArrayItem('additionalServices', key)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Section: Galeria */}
          <section className={styles.section} aria-labelledby="sec-gallery">
            <header className={styles.secHead}>
              <Heading variant="subsection" as="h2" id="sec-gallery">
                Galeria
              </Heading>
              <span className={styles.secHint}>
                <Text variant="nano" as="span" mono weight="bold" color="secondary">
                  {photos.length}
                </Text>
                <Text variant="nano" as="span" color="muted">
                  {' '}
                  / 10 zdjęć · przeciągnij, by zmienić kolejność
                </Text>
              </span>
            </header>

            <div className={styles.galleryGrid}>
              {photos.map((photo, idx) => (
                <div key={photo.id} className={styles.galleryTile}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Zdjęcie ${idx + 1}`}
                    className={styles.galleryTileImg}
                  />
                  {photo.isPrimary ? (
                    <Text
                      variant="nano"
                      as="span"
                      mono
                      weight="extrabold"
                      className={styles.galleryTileCover}
                    >
                      ★ Okładka
                    </Text>
                  ) : (
                    <Text
                      variant="kicker-sm"
                      as="span"
                      weight="bold"
                      className={styles.galleryTileIdx}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </Text>
                  )}
                  <div className={styles.galleryTileActions}>
                    <button
                      type="button"
                      className={[styles.tileMiniBtn, styles.tileMiniDanger].join(' ')}
                      onClick={() => handleDeletePhoto(photo.id)}
                      aria-label="Usuń zdjęcie"
                    >
                      <IconTrash width="11" height="11" />
                    </button>
                  </div>
                </div>
              ))}

              {photos.length < 10 && (
                <button
                  type="button"
                  className={styles.galleryEmpty}
                  aria-label="Dodaj zdjęcie"
                  onClick={() => {
                    // Photo upload via URL for now (DropZone flow not yet wired)
                    const url = window.prompt('Wklej URL zdjęcia');
                    if (url) {
                      profileApi
                        .addPhoto(url)
                        .then(() => revalidatePhotos())
                        .catch(() => {});
                    }
                  }}
                >
                  <IconCamera width="24" height="24" />
                  <Text variant="nano" as="span" mono weight="bold">
                    Dodaj
                  </Text>
                </button>
              )}
            </div>

            <Text variant="caption" as="p" color="muted" className={styles.fieldHint}>
              Rekomendacja: zdjęcia poziome 4:3, min. 1200×900 px.
            </Text>
          </section>

          {/* Section: Kontakt i adres */}
          <section className={styles.section} aria-labelledby="sec-contact">
            <header className={styles.secHead}>
              <Heading variant="subsection" as="h2" id="sec-contact">
                Kontakt i adres
              </Heading>
            </header>

            <div className={styles.fieldRow2}>
              <Input
                label="Adres warsztatu *"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="ul. Przykładowa 1, 00-000 Miasto"
              />
              <Input
                label="Telefon publiczny"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+48 600 000 000"
                type="tel"
              />
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleText}>
                <Text variant="body-sm" as="p" weight="bold">
                  Pokaż numer telefonu na karcie
                </Text>
                <Text variant="caption" as="p" color="muted">
                  Klient może zadzwonić jednym tapnięciem — rekomendowane dla mobilnych.
                </Text>
              </div>
              <Toggle
                checked={form.showPhone}
                onChange={(e) => updateField('showPhone', e.target.checked)}
                aria-label="Widoczność telefonu"
              />
            </div>
          </section>
        </div>

        {/* Preview column */}
        <PhonePreview form={form} photos={photos} />
      </div>
    </div>
  );
}
