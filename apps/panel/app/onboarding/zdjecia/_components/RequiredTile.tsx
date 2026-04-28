import { useRef, useState } from 'react';
import { Spinner, Text } from '@opony/design-system-web';
import type { PhotoType, ProviderPhoto } from '../../../../lib/hooks/use-photos-flow';
import {
  IconCamera,
  IconUpload,
  IconRefresh,
  IconStar,
  IconTrash,
  IconPencil,
} from '../../../../components/icons';
import styles from '../zdjecia.module.css';
import { formatSize, type RequiredTileDef } from './utils';

interface RequiredTileProps {
  def: RequiredTileDef;
  photo: ProviderPhoto | undefined;
  isUploading: boolean;
  photoIndex: number;
  onUpload: (file: File, type: PhotoType) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSetPrimary: (id: string) => void;
}

export function RequiredTile({
  def,
  photo,
  isUploading,
  photoIndex,
  onUpload,
  onRemove,
  onRename,
  onSetPrimary,
}: RequiredTileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState('');

  function handleClick() {
    if (!photo && !isUploading) inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, def.type);
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

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setEditName(photo?.originalName ?? '');
    setIsRenaming(true);
  }

  function commitRename() {
    if (photo) onRename(photo.id, editName);
    setIsRenaming(false);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsRenaming(false);
  }

  const isDone = !!photo;
  const isPrimary = photo?.isPrimary ?? false;

  const tileClass = [
    styles.photoTile,
    isDone ? styles.photoTileDone : styles.photoTileEmpty,
    isDone && isPrimary ? styles.photoTilePrimary : '',
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

      {isUploading && (
        <div className={styles.tileLoading}>
          <Spinner size="md" label="Przesyłanie…" />
        </div>
      )}

      {isDone && photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.photoThumb} src={photo.url} alt={def.title} />

          <Text
            variant="nano"
            as="span"
            className={`${styles.tileIndex} ${styles.tileIndexAccent}`}
          >
            {`0${photoIndex} / 03`}
          </Text>

          {isPrimary && (
            <Text variant="nano" as="span" className={styles.tilePrimaryBadge}>
              <IconStar width={8} height={8} />
              Główne
            </Text>
          )}

          <div className={styles.tileOverlay}>
            <div className={styles.tileLabelCol}>
              <Text variant="nano" as="span" className={styles.tileType}>
                {def.title}
              </Text>
              {isRenaming ? (
                <input
                  className={styles.tileRenameInput}
                  value={editName}
                  autoFocus
                  maxLength={255}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <Text variant="body-sm" as="span" className={styles.tileName}>
                  {photo.originalName}
                </Text>
              )}
              <Text variant="kicker-sm" as="span" className={styles.tileSize}>
                {formatSize(photo.size)}
              </Text>
            </div>
            <div className={styles.tileActions}>
              <button
                type="button"
                className={styles.tileBtn}
                aria-label="Zmień plik"
                onClick={handleReplaceClick}
                onKeyDown={handleReplaceKey}
              >
                <IconRefresh width={11} height={11} />
              </button>
              <button
                type="button"
                className={styles.tileBtn}
                aria-label="Zmień nazwę"
                onClick={startRename}
              >
                <IconPencil width={11} height={11} />
              </button>
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
              <button
                type="button"
                className={`${styles.tileBtn} ${styles.tileBtnDanger}`}
                aria-label="Usuń"
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
          <Text variant="nano" as="span" className={styles.emptyReqTag}>
            Wymagane · {def.index}
          </Text>
          <div className={styles.emptyIco} aria-hidden="true">
            <IconCamera width={24} height={24} />
          </div>
          <Text variant="body" as="span" weight="bold" className={styles.emptyTitle}>
            {def.title}
          </Text>
          <Text variant="body-sm" as="span" className={styles.emptySub}>
            {def.sub}
          </Text>
          <Text variant="nano" as="span" className={styles.emptyHint}>
            <IconUpload width={10} height={10} />
            Upuść lub kliknij
          </Text>
        </>
      )}
    </article>
  );
}
