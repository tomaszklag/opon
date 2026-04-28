'use client';

import { Heading, Text, Spinner, Button, Modal } from '@opony/design-system-web';
import { usePricingTiers } from '../../../lib/hooks/use-pricing-tiers';
import { useMarketPrices, getMarketRef } from '../../../lib/hooks/use-market-prices';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { PricingActionBar } from './_components/PricingActionBar';
import { TierList } from './_components/TierList';
import { TravelFeeSection } from './_components/TravelFeeSection';
import { ServicesSection } from './_components/ServicesSection';
import { PricingInfoNote } from './_components/PricingInfoNote';
import { PricingPreview } from './_components/PricingPreview';
import styles from './pricing.module.css';

export default function PricingPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const marketPrices = useMarketPrices();
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
    revert,
    travelFee,
    updateTravelFee,
    globalBalancingEnabled,
    globalBalancingPrice,
    updateGlobalBalancing,
  } = usePricingTiers();

  const {
    showModal: showNavWarning,
    confirm: confirmNav,
    cancel: cancelNav,
  } = useNavigationGuard(dirty);

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie cennika…" />
      </div>
    );
  }

  function applyMarketPreset() {
    drafts.forEach((d, idx) => {
      const ref = getMarketRef(marketPrices, d.rimSizeMin, d.rimSizeMax);
      if (ref) {
        const avg = Math.round((ref.priceMin + ref.priceMax) / 2);
        updateDraft(idx, { priceSwapPln: avg });
      }
    });
  }

  const hasMarketData = marketPrices.length > 0 && drafts.length > 0;

  return (
    <>
      <Modal
        isOpen={showNavWarning}
        onClose={cancelNav}
        title="Niezapisane zmiany"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={cancelNav}>
              Zostań na stronie
            </Button>
            <Button variant="danger" size="sm" onClick={confirmNav}>
              Opuść bez zapisywania
            </Button>
          </>
        }
      >
        <Text variant="body-sm" as="p" color="secondary">
          Masz niezapisane zmiany w cenniku. Jeśli opuścisz tę stronę, zmiany zostaną utracone.
        </Text>
      </Modal>
      <div className={styles.page}>
        <PricingActionBar
          dirty={dirty}
          saved={saved}
          saving={saving}
          showAddForm={showAddForm}
          onOpenAddForm={openAddForm}
          onSave={save}
          onRevert={revert}
        />

        <div className={styles.content}>
          <div className={styles.formCol}>
            <header className={styles.pageHero}>
              <div>
                <Heading variant="display" as="h1" className={styles.pageTitle}>
                  Cennik
                </Heading>
                <div className={styles.pageSubRow}>
                  <Text variant="label" as="span" className={styles.liveChip}>
                    Widoczny publicznie
                  </Text>
                  <Text variant="body-sm" as="span" color="secondary">
                    w profilu warsztatu — klient widzi te ceny przy wyszukiwaniu
                  </Text>
                </div>
              </div>
              {hasMarketData && (
                <Button variant="ghost" size="sm" onClick={applyMarketPreset}>
                  Użyj cen rynkowych okolicy
                </Button>
              )}
            </header>

            <TierList
              drafts={drafts}
              showAddForm={showAddForm}
              newTierForm={newTierForm}
              errors={errors}
              marketPrices={marketPrices}
              onUpdate={updateDraft}
              onDelete={deleteDraft}
              onCancelAdd={cancelAddForm}
            />

            <TravelFeeSection travelFee={travelFee} onUpdate={updateTravelFee} />

            <ServicesSection
              balancingEnabled={globalBalancingEnabled}
              balancingPrice={globalBalancingPrice}
              onUpdate={updateGlobalBalancing}
            />

            <PricingInfoNote />
          </div>

          <PricingPreview
            drafts={drafts}
            globalBalancingEnabled={globalBalancingEnabled}
            globalBalancingPrice={globalBalancingPrice}
          />
        </div>
      </div>
    </>
  );
}
