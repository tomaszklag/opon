'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@opony/design-system-web';
import { Button, Spinner } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { usePhotosFlow } from '../../../lib/hooks/use-photos-flow';
import type { PhotoType, ProviderPhoto } from '../../../lib/hooks/use-photos-flow';
import { IconTrash, IconArrowRight, IconInfo, IconRefresh } from '../../../components/icons';
import styles from './zdjecia.module.css';

/* ---------- icons used only here ---------- */
function IconCamera(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.5l-1.5-2h-6l-1.5 2H5a2 2 0 0 0-2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconUpload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12" />
    </svg>
  );
}

function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9 12 2" />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/* ---------- stepper config ---------- */
const STEPS = [
  { label: 'Firma', status: 'done' as const },
  { label: 'Zdjęcia', status: 'active' as const },
  { label: 'Weryfikacja', status: 'upcoming' as const },
];

/* ---------- required tile definitions ---------- */
interface RequiredTileDef {
  type: PhotoType;
  title: string;
  sub: string;
  index: string;
}

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

/* ---------- helpers ---------- */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ---------- Required photo tile ---------- */
interface RequiredTileProps {
  def: RequiredTileDef;
  photo: ProviderPhoto | undefined;
  isUploading: boolean;
  photoIndex: number;
  onUpload: (file: File, type: PhotoType) => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

function RequiredTile({
  def,
  photo,
  isUploading,
  photoIndex,
  onUpload,
  onRemove,
  onSetPrimary,
}: RequiredTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (!photo && !isUploading) {
      inputRef.current?.click();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, def.type);
      // reset so same file can be re-selected
      e.target.value = '';
    }
  }

  function handleReplaceClick(e: React.MouseEvent) {
    e.stopPropagation();
    inputRef.current?.click();
  }

  function handleReplaceKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      inputRef.current?.click();
    }
  }

  const isDone = !!photo;
  const isPrimary = photo?.isPrimary ?? false;

  const tileClass = [
    styles.photoTile,
    isDone ? (isPrimary ? styles.photoTilePrimary : styles.photoTileDone) : styles.photoTileEmpty,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={tileClass}
      onClick={handleClick}
      role={!isDone ? 'button' : undefined}
      aria-label={!isDone ? `Dodaj zdjęcie: ${def.title}` : def.title}
      tabIndex={!isDone ? 0 : undefined}
      onKeyDown={
        !isDone
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }
          : undefined
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Loading overlay */}
      {isUploading && (
        <div className={styles.tileLoading}>
          <Spinner size="md" label="Przesyłanie…" />
        </div>
      )}

      {isDone && photo ? (
        <>
          {/* Thumbnail */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.photoThumb} src={photo.url} alt={def.title} />

          {/* Index badge */}
          <span className={`${styles.tileIndex} ${styles.tileIndexAccent}`}>
            {photoIndex > 0 ? `0${photoIndex} / 03` : def.index}
          </span>

          {/* Primary star badge */}
          {isPrimary && (
            <span className={styles.tilePrimaryBadge}>
              <IconStar width={8} height={8} />
              Główne
            </span>
          )}

          {/* Overlay with info + actions */}
          <div className={styles.tileOverlay}>
            <div className={styles.tileLabelCol}>
              <span className={styles.tileType}>{def.title}</span>
              <span className={styles.tileName}>{photo.originalName}</span>
              <span className={styles.tileSize}>{formatSize(photo.size)}</span>
            </div>
            <div className={styles.tileActions}>
              {/* Replace button */}
              <button
                type="button"
                className={styles.tileBtn}
                aria-label="Zmień zdjęcie"
                onClick={handleReplaceClick}
                onKeyDown={handleReplaceKey}
              >
                <IconRefresh width={11} height={11} />
              </button>
              {/* Set primary (only if not already primary) */}
              {!isPrimary && (
                <button
                  type="button"
                  className={styles.tileBtn}
                  aria-label="Ustaw jako główne"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrimary(photo.id);
                  }}
                >
                  <IconStar width={11} height={11} />
                </button>
              )}
              {/* Delete button */}
              <button
                type="button"
                className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                aria-label="Usuń zdjęcie"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(photo.id);
                }}
              >
                <IconTrash width={11} height={11} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Required tag */}
          <span className={styles.emptyReqTag}>Wymagane · {def.index}</span>

          {/* Camera icon */}
          <div className={styles.emptyIco} aria-hidden="true">
            <IconCamera width={24} height={24} />
          </div>

          {/* Title & sub */}
          <span className={styles.emptyTitle}>{def.title}</span>
          <span className={styles.emptySub}>{def.sub}</span>

          {/* Upload hint */}
          <span className={styles.emptyHint}>
            <IconUpload width={10} height={10} />
            Upuść lub kliknij
          </span>
        </>
      )}
    </article>
  );
}

/* ---------- Additional photo tile ---------- */
interface AddTileProps {
  photo: ProviderPhoto;
  onRemove: (id: string) => void;
}

function AddTile({ photo, onRemove }: AddTileProps) {
  return (
    <article className={styles.addTile}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.originalName} />
      <div className={styles.addTileOverlay}>
        <button
          type="button"
          className={styles.addTileBtn}
          aria-label="Usuń zdjęcie"
          onClick={() => onRemove(photo.id)}
        >
          <IconX width={9} height={9} />
        </button>
      </div>
    </article>
  );
}

/* ---------- Add-more slot ---------- */
interface AddMoreProps {
  onUpload: () => void;
  dim?: boolean;
}

function AddMoreSlot({ onUpload, dim }: AddMoreProps) {
  return (
    <button
      type="button"
      className={styles.addMore}
      style={dim ? { opacity: 0.5 } : undefined}
      onClick={onUpload}
      aria-label="Dodaj zdjęcie"
    >
      <span className={styles.addMorePlus}>+</span>
      <span className={styles.addMoreLabel}>Dodaj zdjęcie</span>
    </button>
  );
}

/* ================================================================
   PAGE
   ================================================================ */
export default function PhotosPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuthGuard('/onboarding/zdjecia');
  const { photos, isLoading, uploading, error, upload, remove, setPrimary, canProceed } =
    usePhotosFlow();

  // Hidden file input for additional photos
  const addInputRef = useRef<HTMLInputElement>(null);

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

  // Separate required photos by type
  const requiredPhotos: Record<PhotoType, ProviderPhoto | undefined> = {
    LOGO: photos.find((p) => p.type === 'LOGO'),
    VEHICLE: photos.find((p) => p.type === 'VEHICLE'),
    WORKSPACE: photos.find((p) => p.type === 'WORKSPACE'),
    ADDITIONAL: undefined,
  };

  const additionalPhotos = photos.filter((p) => p.type === 'ADDITIONAL');
  const uploadedRequired = REQUIRED_TILES.filter((t) => !!requiredPhotos[t.type]).length;
  const progressPct = Math.round((uploadedRequired / 3) * 100);

  // How many add-more empty slots to show (always show 6 total slots: filled + empty up to 6)
  const MAX_ADDITIONAL = 10;
  const totalAdditional = additionalPhotos.length;
  const slotsToShow = Math.max(0, 6 - totalAdditional);
  const canAddMore = totalAdditional < MAX_ADDITIONAL;

  return (
    <div className={styles.page}>
      {/* Top strip */}
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

      {/* Stepper */}
      <div className={styles.stepperBar}>
        <StepIndicator steps={STEPS} />
      </div>

      {/* Scrollable content */}
      <div className={styles.formScroll}>
        <div className={styles.formInner}>
          {/* Hero */}
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Wgraj zdjęcia</h1>
            <p className={styles.heroSub}>
              Warsztaty ze zdjęciami otrzymują <strong>do 3× więcej rezerwacji</strong> niż te bez.
              Potrzebujemy minimum 3 zdjęć — logo, pojazdu/warsztatu i stanowiska pracy.
            </p>
            <div className={styles.heroTips}>
              <span className={styles.tipChip}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 9l9-6 9 6v12H3V9Z" />
                  <path d="M9 22V12h6v10" />
                </svg>
                Dzienne światło
              </span>
              <span className={styles.tipChip}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 5h18v14H3z" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Szeroki kadr
              </span>
              <span className={styles.tipChip}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12 5 5L20 7" />
                </svg>
                Czysto i profesjonalnie
              </span>
              <span className={styles.tipChip}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M6 6l12 12" />
                </svg>
                Bez osób w tle
              </span>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className={styles.errorNotice} role="alert">
              {error}
            </div>
          )}

          {/* Progress row */}
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

          {/* Required photos section */}
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

          {/* Additional photos section */}
          <div className={styles.sectionLabel}>
            <h2 className={styles.sectionTitle}>Dodatkowe zdjęcia</h2>
            <span className={styles.sectionSub}>
              Opcjonalne · <strong>{totalAdditional}</strong> / 10 — pokaż więcej, zwiększ
              zainteresowanie
            </span>
          </div>

          {/* Hidden file input for additional */}
          <input
            ref={addInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAddFileChange}
          />

          <div className={styles.addGrid}>
            {/* Existing additional photos */}
            {additionalPhotos.map((photo) => (
              <AddTile key={photo.id} photo={photo} onRemove={remove} />
            ))}

            {/* Loading slot while uploading additional */}
            {uploading === 'additional' && (
              <div
                className={styles.addTile}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Spinner size="sm" label="Przesyłanie…" />
              </div>
            )}

            {/* Add-more empty slots (show up to 6 total incl. uploading) */}
            {canAddMore &&
              Array.from({ length: slotsToShow - (uploading === 'additional' ? 1 : 0) }).map(
                (_, i) => (
                  <AddMoreSlot key={`add-more-${i}`} onUpload={handleAddMore} dim={i > 0} />
                ),
              )}
          </div>

          {/* Info panel */}
          <div className={styles.infoPanelDashed}>
            <IconInfo width={14} height={14} />
            <div>
              <strong>JPG / PNG / WEBP</strong> · max 5 MB per zdjęcie · rekomendowane min. 1200×800
              px · <strong>10 zdjęć maksymalnie</strong>. Po zatwierdzeniu konta zdjęcia pojawią się
              publicznie w profilu warsztatu.
            </div>
          </div>

          {/* CTA row */}
          <div className={styles.ctaRow}>
            <p className={styles.ctaNote}>
              Zdjęcie &bdquo;Stanowisko pracy&rdquo; jest wymagane, żeby przejść dalej. Masz
              zapisany szkic — możesz wrócić później.
            </p>
            <div className={styles.ctaGroup}>
              <Button
                type="button"
                variant="secondary"
                className={styles.ctaBtnBack}
                onClick={() => router.back()}
              >
                <IconChevronLeft width={14} height={14} />
                Wstecz
                <span className={styles.ctaBtnLabel}>Firma</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                className={styles.ctaBtnNext}
                disabled={!canProceed}
                onClick={() => router.push('/onboarding/weryfikacja')}
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
