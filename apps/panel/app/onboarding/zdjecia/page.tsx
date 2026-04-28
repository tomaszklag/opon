'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@opony/design-system-web';
import { Button, Spinner } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { usePhotosFlow } from '../../../lib/hooks/use-photos-flow';
import type { PhotoType } from '../../../lib/hooks/use-photos-flow';
import {
  IconArrowRight,
  IconInfo,
  IconChevronLeft,
  IconHome,
  IconDisplay,
  IconCheck,
  IconBan,
} from '../../../components/icons';
import { RequiredTile } from './_components/RequiredTile';
import { AddTile } from './_components/AddTile';
import { AddMoreSlot } from './_components/AddMoreSlot';
import type { RequiredTileDef } from './_components/utils';
import styles from './zdjecia.module.css';

const STEPS = [
  { label: 'Firma', status: 'done' as const },
  { label: 'Zdjęcia', status: 'active' as const },
  { label: 'Weryfikacja', status: 'upcoming' as const },
];

const REQUIRED_TILES: RequiredTileDef[] = [
  {
    type: 'LOGO',
    title: 'Logo / Awatar',
    sub: 'Logotyp lub zdjęcie profilowe warsztatu. Wyraźne, kwadratowe lub poziome.',
    index: '01 / 03',
  },
  {
    type: 'VEHICLE',
    title: 'Van / Pojazd',
    sub: 'Zdjęcie pojazdu serwisowego lub warsztatu. Pokaż, czym pracujesz.',
    index: '02 / 03',
  },
  {
    type: 'WORKSPACE',
    title: 'Stanowisko pracy',
    sub: 'Miejsce wymiany opon w vanie lub warsztacie. Pokaż sprzęt.',
    index: '03 / 03',
  },
];

export default function PhotosPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard('/onboarding/zdjecia');
  const { photos, isLoading, uploading, error, upload, remove, setPrimary, canProceed } =
    usePhotosFlow();

  const addInputRef = useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = useState(false);

  function handleAddMore() {
    addInputRef.current?.click();
  }

  function handleAddFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      upload(file, 'ADDITIONAL');
      e.target.value = '';
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  const requiredPhotos: Record<PhotoType, ReturnType<typeof photos.find>> = {
    LOGO: photos.find((p) => p.type === 'LOGO'),
    VEHICLE: photos.find((p) => p.type === 'VEHICLE'),
    WORKSPACE: photos.find((p) => p.type === 'WORKSPACE'),
    ADDITIONAL: undefined,
  };

  const additionalPhotos = photos.filter((p) => p.type === 'ADDITIONAL');
  const uploadedRequired = REQUIRED_TILES.filter((t) => !!requiredPhotos[t.type]).length;
  const progressPct = Math.round((uploadedRequired / 3) * 100);

  const MAX_ADDITIONAL = 10;
  const totalAdditional = additionalPhotos.length;
  const slotsToShow = Math.max(0, 6 - totalAdditional);
  const canAddMore = totalAdditional < MAX_ADDITIONAL;

  return (
    <div className={styles.page}>
      <header className={styles.topStrip}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandWordmark}>
            OPONY
            <span className={styles.brandDot} />
          </span>
          <span className={styles.panelTag}>PANEL</span>
        </Link>
        <span className={styles.topStripSpacer} />
        <span className={styles.saveDraftStrip}>
          <span className={styles.saveDraftPulse} aria-hidden="true" />
          Szkic zapisany automatycznie
        </span>
      </header>

      <div className={styles.stepperBar}>
        <StepIndicator steps={STEPS} />
      </div>

      <div className={styles.formScroll}>
        <div className={styles.formInner}>
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Wgraj zdjęcia</h1>
            <p className={styles.heroSub}>
              Warsztaty ze zdjęciami otrzymują <strong>do 3× więcej rezerwacji</strong> niż te bez.
              Potrzebujemy minimum 3 zdjęć — logo, pojazdu/warsztatu i stanowiska pracy.
            </p>
            <div className={styles.heroTips}>
              <span className={styles.tipChip}>
                <IconHome width={11} height={11} />
                Dzienne światło
              </span>
              <span className={styles.tipChip}>
                <IconDisplay width={11} height={11} />
                Szeroki kadr
              </span>
              <span className={styles.tipChip}>
                <IconCheck width={11} height={11} />
                Czysto i profesjonalnie
              </span>
              <span className={styles.tipChip}>
                <IconBan width={11} height={11} />
                Bez osób w tle
              </span>
            </div>
          </div>

          {error && (
            <div className={styles.errorNotice} role="alert">
              {error}
            </div>
          )}

          <div className={styles.progressRow}>
            <span>Postęp uploadu</span>
            <div
              className={styles.progressBarWrap}
              role="progressbar"
              aria-valuenow={uploadedRequired}
              aria-valuemin={0}
              aria-valuemax={3}
            >
              <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
            </div>
            <span className={styles.progressCount}>
              <strong>{uploadedRequired}</strong> / 3 wymagane
            </span>
          </div>

          <div className={styles.sectionLabel}>
            <h2 className={styles.sectionTitle}>Wymagane zdjęcia</h2>
            <span className={styles.sectionSub}>
              <strong>3</strong> minimum · <strong>JPG / PNG</strong> · max 5&nbsp;MB / zdjęcie
            </span>
          </div>

          <div className={styles.reqGrid}>
            {REQUIRED_TILES.map((def, i) => (
              <RequiredTile
                key={def.type}
                def={def}
                photo={requiredPhotos[def.type]}
                isUploading={uploading === def.type}
                photoIndex={i + 1}
                onUpload={upload}
                onRemove={remove}
                onSetPrimary={setPrimary}
              />
            ))}
          </div>

          <div className={styles.sectionLabel}>
            <h2 className={styles.sectionTitle}>Dodatkowe zdjęcia</h2>
            <span className={styles.sectionSub}>
              Opcjonalne · <strong>{totalAdditional}</strong> / 10 — pokaż więcej, zwiększ
              zainteresowanie
            </span>
          </div>

          <input
            ref={addInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAddFileChange}
          />

          <div className={styles.addGrid}>
            {additionalPhotos.map((photo) => (
              <AddTile key={photo.id} photo={photo} onRemove={remove} />
            ))}

            {uploading === 'additional' && (
              <div
                className={styles.addTile}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Spinner size="sm" label="Przesyłanie…" />
              </div>
            )}

            {canAddMore &&
              Array.from({ length: slotsToShow - (uploading === 'additional' ? 1 : 0) }).map(
                (_, i) => (
                  <AddMoreSlot key={`add-more-${i}`} onUpload={handleAddMore} dim={i > 0} />
                ),
              )}
          </div>

          <div className={styles.infoPanelDashed}>
            <IconInfo width={14} height={14} />
            <div>
              <strong>JPG / PNG / WEBP</strong> · max 5 MB per zdjęcie · rekomendowane min. 1200×800
              px · <strong>10 zdjęć maksymalnie</strong>. Po zatwierdzeniu konta zdjęcia pojawią się
              publicznie w profilu warsztatu.
            </div>
          </div>

          {attempted && !canProceed && (
            <div className={styles.errorNotice} role="alert">
              Wymagane zdjęcia:{' '}
              <strong>
                {REQUIRED_TILES.filter((t) => !requiredPhotos[t.type])
                  .map((t) => t.title)
                  .join(', ')}
              </strong>
              . Dodaj je, żeby przejść dalej.
            </div>
          )}

          <div className={styles.ctaRow}>
            <p className={styles.ctaNote}>
              Masz zapisany szkic — możesz wrócić i dokończyć później.
            </p>
            <div className={styles.ctaGroup}>
              <Button type="button" variant="neutral" onClick={() => router.back()}>
                <IconChevronLeft width={14} height={14} />
                Wstecz
                <span className={styles.ctaBtnLabel}>Firma</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  setAttempted(true);
                  if (canProceed) router.push('/onboarding/weryfikacja');
                }}
              >
                Dalej
                <IconArrowRight width={16} height={16} />
                <span className={styles.ctaBtnLabel}>Weryfikacja</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
