import { useState } from 'react';
import { IconButton, InlineInput, Text } from '@opony/design-system-web';
import type { ProviderPhoto } from '../../../../lib/hooks/use-photos-flow';
import { IconTrash, IconPencil } from '../../../../components/icons';
import styles from '../zdjecia.module.css';
import { formatSize } from './utils';

interface AddTileProps {
  photo: ProviderPhoto;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function AddTile({ photo, onRemove, onRename }: AddTileProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState('');

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setEditName(photo.originalName);
    setIsRenaming(true);
  }

  function commitRename() {
    onRename(photo.id, editName);
    setIsRenaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsRenaming(false);
  }

  return (
    <article className={styles.addTile}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.originalName} />
      <div className={styles.addTileOverlay}>
        <div className={styles.tileLabelCol}>
          {isRenaming ? (
            <InlineInput
              className={styles.tileRenameInput}
              value={editName}
              autoFocus
              maxLength={255}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Text variant="kicker-sm" as="span" className={styles.tileName}>
              {photo.originalName}
            </Text>
          )}
          <Text variant="kicker-sm" as="span" className={styles.tileSize}>
            {formatSize(photo.size)}
          </Text>
        </div>
        <div className={styles.tileActions}>
          <IconButton
            size="xs"
            aria-label="Zmień nazwę"
            data-tooltip="Zmień nazwę"
            onClick={startRename}
          >
            <IconPencil width={9} height={9} />
          </IconButton>
          <IconButton
            size="xs"
            variant="danger"
            aria-label="Usuń zdjęcie"
            data-tooltip="Usuń"
            onClick={() => onRemove(photo.id)}
          >
            <IconTrash width={9} height={9} />
          </IconButton>
        </div>
      </div>
    </article>
  );
}
