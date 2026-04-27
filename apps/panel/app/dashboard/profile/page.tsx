'use client';

import { NoticeBlock } from '@opony/design-system-web';
import { useProviderForm } from '../../../lib/hooks/use-provider-form';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { ProfileActionBar } from './_components/ProfileActionBar';
import { IdentitySection } from './_components/IdentitySection';
import { ContactSection } from './_components/ContactSection';
import { LocationSection } from './_components/LocationSection';
import { ProfilePreview } from './_components/ProfilePreview';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { form, provider, loading, saved, apiError, onSubmit, isDirty, isSubmitting } =
    useProviderForm();
  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const name = watch('name') ?? '';
  const logoUrl = watch('logoUrl') ?? '';
  const description = watch('description') ?? '';
  const phone = watch('phone') ?? '';
  const email = watch('email') ?? '';

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className={styles.page}>
      <ProfileActionBar
        isDirty={isDirty}
        saved={saved}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>Profil firmy</h1>
            <p className={styles.pageSub}>
              Dane widoczne publicznie w wynikach wyszukiwania i na karcie warsztatu.
            </p>
          </header>

          {apiError && <NoticeBlock variant="danger">{apiError}</NoticeBlock>}

          <IdentitySection
            register={register}
            errors={errors}
            description={description}
            nip={provider.nip}
          />
          <ContactSection register={register} errors={errors} />
          <LocationSection
            register={register}
            errors={errors}
            cityCenterLat={provider.cityCenterLat}
            cityCenterLng={provider.cityCenterLng}
            status={provider.status}
          />
        </div>

        <ProfilePreview
          name={name}
          logoUrl={logoUrl}
          description={description}
          phone={phone}
          email={email}
          cityCenterLat={provider.cityCenterLat}
          cityCenterLng={provider.cityCenterLng}
        />
      </div>
    </div>
  );
}
