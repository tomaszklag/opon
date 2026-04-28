import { useState } from 'react';
import type { ProviderPhoto } from '../../../../lib/hooks/use-photos-flow';
import { IconXClose, IconPencil } from '../../../../components/icons';
import styles from '../zdjecia.module.css';

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
        {isRenaming ? (
          <input
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
          <button
            type="button"
            className={styles.addTileBtn}
            aria-label="Zmień nazwę"
            onClick={startRename}
          >
            <IconPencil width={9} height={9} />
          </button>
        )}
        <button
          type="button"
          className={styles.addTileBtn}
          aria-label="Usuń"
          onClick={() => onRemove(photo.id)}
        >
          <IconXClose width={9} height={9} />
        </button>
      </div>
    </article>
  );
}
