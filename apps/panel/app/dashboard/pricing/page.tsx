'use client';

import { Heading, Text } from '@opony/design-system-web';
import { usePricingTiers } from '../../../lib/hooks/use-pricing-tiers';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { PricingActionBar } from './_components/PricingActionBar';
import { TierList } from './_components/TierList';
import { PricingInfoNote } from './_components/PricingInfoNote';
import { PricingPreview } from './_components/PricingPreview';
import styles from './pricing.module.css';

export default function PricingPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    drafts,
    newTierForm,
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

  if (authLoading || loading) {
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
            <Heading variant="display" as="h1" className={styles.pageTitle}>
              Cennik
            </Heading>
            <Text variant="body-md" as="p" className={styles.pageSub}>
              Widoczny publicznie — klient widzi te ceny przy wyszukiwaniu warsztatu.
            </Text>
          </header>

          <TierList
            drafts={drafts}
            showAddForm={showAddForm}
            newTierForm={newTierForm}
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
