import styles from '../profile.module.css';

interface Props {
  name: string;
  logoUrl: string;
  description: string;
  phone: string;
  email: string;
  cityCenterLat: number | null | undefined;
  cityCenterLng: number | null | undefined;
}

export function ProfilePreview({
  name,
  logoUrl,
  description,
  phone,
  email,
  cityCenterLat,
  cityCenterLng,
}: Props) {
  const locationLabel =
    cityCenterLat != null && cityCenterLng != null
      ? `${cityCenterLat.toFixed(4)}, ${cityCenterLng.toFixed(4)}`
      : '—';

  return (
    <aside className={styles.previewCol}>
      <div className={styles.previewPanel}>
        <div className={styles.previewHead}>
          <span className={styles.previewTitle}>Podgląd karty</span>
          <span className={styles.previewSub}>jak widzi klient</span>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewAvatar}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className={styles.previewAvatarImg} />
            ) : (
              <span className={styles.previewAvatarInitials}>
                {name.slice(0, 2).toUpperCase() || 'WW'}
              </span>
            )}
          </div>
          <div className={styles.previewCardBody}>
            <span className={styles.previewName}>
              {name || <span className={styles.previewPlaceholder}>Nazwa firmy</span>}
            </span>
            <span className={styles.previewLocation}>{locationLabel}</span>
            {description && (
              <p className={styles.previewDesc}>
                {description.length > 120 ? description.slice(0, 120) + '…' : description}
              </p>
            )}
            <div className={styles.previewContact}>
              {phone && <span>{phone}</span>}
              {email && <span>{email}</span>}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
