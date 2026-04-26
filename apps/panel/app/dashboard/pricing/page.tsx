'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePricingTiers } from '../../../lib/hooks/use-pricing-tiers';
import { useAuth } from '../../../lib/auth';
import { PricingActionBar } from './_components/PricingActionBar';
import { TierList } from './_components/TierList';
import { PricingInfoNote } from './_components/PricingInfoNote';
import { PricingPreview } from './_components/PricingPreview';
import styles from './pricing.module.css';

export default function PricingPage() {
  const router = useRouter();
  const { status } = useAuth();
  const {
    drafts,
    newTier,
    setNewTier,
    loading,
    saving,
    saved,
    dirty,
    showAddForm,
    errors,
    updateDraft,
    deleteDraft,
    openAddForm,
    cancelAddForm,
    save,
  } = usePricingTiers();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PricingActionBar
        dirty={dirty}
        saved={saved}
        saving={saving}
        showAddForm={showAddForm}
        onOpenAddForm={openAddForm}
        onSave={save}
      />

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>Cennik</h1>
            <p className={styles.pageSub}>
              Widoczny publicznie — klient widzi te ceny przy wyszukiwaniu warsztatu.
            </p>
          </header>

          <TierList
            drafts={drafts}
            showAddForm={showAddForm}
            newTier={newTier}
            setNewTier={setNewTier}
            errors={errors}
            onUpdate={updateDraft}
            onDelete={deleteDraft}
            onCancelAdd={cancelAddForm}
          />

          <PricingInfoNote />
        </div>

        <PricingPreview drafts={drafts} />
      </div>
    </div>
  );
}
