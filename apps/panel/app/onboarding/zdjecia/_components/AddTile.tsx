import type { ProviderPhoto } from '../../../../lib/hooks/use-photos-flow';
import { IconXClose } from '../../../../components/icons';
import styles from '../zdjecia.module.css';

interface AddTileProps {
  photo: ProviderPhoto;
  onRemove: (id: string) => void;
}

export function AddTile({ photo, onRemove }: AddTileProps) {
  return (
    <article className={styles.addTile}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.originalName} />
      <div className={styles.addTileOverlay}>
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
