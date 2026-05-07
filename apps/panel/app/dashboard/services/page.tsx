'use client';

import { useState } from 'react';
import { Button, Heading, Modal, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { useServicesPage } from '../../../lib/hooks/use-services-page';
import { servicesApi } from '../../../api-data-access/services';
import { IconPlus, IconRefresh, IconHelp } from '../../../components/icons';
import { ServiceCard } from './_components/ServiceCard';
import { AddonCollection } from './_components/AddonCollection';
import { NewServiceBlock } from './_components/NewServiceBlock';
import { SimulationCard } from './_components/SimulationCard';
import type { ServicePricingType, ServiceState, AddonState } from './_types';
import styles from './services.module.css';

interface DeleteConfirm {
  type: 'service' | 'addon';
  id: string;
  name: string;
}

export default function ServicesPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    state,
    isLoading,
    isSaving,
    saveError,
    dirty,
    saved,
    updateState,
    removeService,
    removeAddon,
    revert,
    save,
  } = useServicesPage();
  const [addingService, setAddingService] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirm | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showModal, confirm: confirmNav, cancel: cancelNav } = useNavigationGuard(dirty);

  function updateServices(services: ServiceState[]) {
    updateState((prev) => ({ ...prev, services }));
  }

  function updateAddons(addons: AddonState[]) {
    updateState((prev) => ({ ...prev, addons }));
  }

  function updateService(serviceId: string, updated: ServiceState) {
    updateServices(state.services.map((s) => (s.id === serviceId ? updated : s)));
  }

  function requestDeleteService(serviceId: string, name: string) {
    setDeleteConfirm({ type: 'service', id: serviceId, name });
  }

  function requestDeleteAddon(addonId: string, name: string) {
    setDeleteConfirm({ type: 'addon', id: addonId, name });
  }

  function toggleServiceEnabled(serviceId: string) {
    updateServices(
      state.services.map((s) => (s.id === serviceId ? { ...s, enabled: !s.enabled } : s)),
    );
  }

  function toggleAddonEnabled(addonId: string) {
    updateAddons(state.addons.map((a) => (a.id === addonId ? { ...a, enabled: !a.enabled } : a)));
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === 'service') {
        await servicesApi.deleteService(deleteConfirm.id);
        removeService(deleteConfirm.id);
      } else {
        await servicesApi.deleteAddon(deleteConfirm.id);
        removeAddon(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    } catch {
      // keep modal open so user knows it failed — they can retry
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCreateService(name: string, pricingType: ServicePricingType) {
    const newId = Math.random().toString(36).slice(2);
    const firstVariant = () => ({
      id: Math.random().toString(36).slice(2),
      name: pricingType === 'VARIANTS' ? '' : null,
      rimSizes: [],
      pricePln: '',
      durationMinutes: '',
      sortOrder: 0,
    });
    const newService: ServiceState = {
      id: newId,
      name,
      description: null,
      pricingType,
      enabled: true,
      sortOrder: state.services.length,
      variants: [firstVariant()],
      subServiceIds: [],
      addonIds: [],
    };
    updateServices([...state.services, newService]);
    setNewlyCreatedId(newId);
    setAddingService(false);
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie…" />
      </div>
    );
  }

  const activeServices = state.services.length;
  const deleteTargetLabel = deleteConfirm?.type === 'service' ? 'usługę' : 'dodatek';

  return (
    <>
      {/* ── Help modal ── */}
      <Modal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="Jak działają usługi?"
        size="sm"
      >
        <div className={styles.helpModalBody}>
          <Text variant="body-sm" as="p" weight="bold">
            Typy cennika
          </Text>
          <Text variant="body-sm" as="p" color="secondary">
            <strong>Rozmiary felg</strong> — definiujesz zakresy R-ek (np. R13–15, R16–17) z własną
            ceną i czasem dla każdego. Klient podaje rozmiar przy rezerwacji.
          </Text>
          <Text variant="body-sm" as="p" color="secondary">
            <strong>Warianty</strong> — np. Osobowe / SUV / Dostawcze. Każdy wariant ma swoją cenę i
            czas. Klient wybiera wariant przy rezerwacji.
          </Text>
          <Text variant="body-sm" as="p" color="secondary">
            <strong>Stała cena</strong> — jedna cena bez względu na pojazd. Idealna dla prostych
            usług serwisowych.
          </Text>
          <div className={styles.helpModalDivider} />
          <Text variant="body-sm" as="p" weight="bold">
            Podusługi i dodatki
          </Text>
          <Text variant="body-sm" as="p" color="secondary">
            <strong>Podusługi</strong> — inne usługi z Twojej oferty sugerowane klientowi przy
            rezerwacji danej usługi (np. wyważanie przy wymianie sezonowej).
          </Text>
          <Text variant="body-sm" as="p" color="secondary">
            <strong>Dodatki</strong> — opcjonalne pozycje z opłatą (np. worek na opony, nowy
            wentyl). Klient zaznacza je sam podczas rezerwacji.
          </Text>
        </div>
      </Modal>

      {/* ── Delete confirmation modal ── */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => !isDeleting && setDeleteConfirm(null)}
        title={`Usuń ${deleteTargetLabel}`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
            >
              Anuluj
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} loading={isDeleting}>
              Usuń
            </Button>
          </>
        }
      >
        <Text variant="body-sm" as="p" color="secondary">
          Czy na pewno chcesz usunąć {deleteTargetLabel}{' '}
          <strong>{deleteConfirm?.name || 'bez nazwy'}</strong>? Jeśli była już używana w
          rezerwacjach, zostanie ukryta (soft delete).
        </Text>
      </Modal>

      {/* ── Navigation guard modal ── */}
      <Modal
        isOpen={showModal}
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
          Masz niezapisane zmiany. Jeśli opuścisz tę stronę, zmiany zostaną utracone.
        </Text>
      </Modal>

      <div className={styles.page}>
        {/* ── Action bar ── */}
        <div className={styles.actionBar}>
          <div className={styles.helpHint}>
            <Text variant="nano" as="span" color="secondary">
              Skonfiguruj usługi i cennik swojego warsztatu.
            </Text>
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
              <IconHelp width="13" height="13" />
              Jak to działa?
            </Button>
          </div>
          <span className={styles.actionBarSpacer} />
          {saveError && (
            <Text variant="nano" as="span" color="danger" className={styles.dirtyChip}>
              {saveError}
            </Text>
          )}
          {dirty && !saveError && (
            <Text variant="nano" as="span" color="warning" className={styles.dirtyChip}>
              Niezapisane zmiany
            </Text>
          )}
          {saved && !dirty && (
            <Text variant="nano" as="span" className={styles.savedChip}>
              Zapisano
            </Text>
          )}
          {dirty && (
            <Button variant="ghost" size="sm" onClick={revert} disabled={isSaving}>
              <IconRefresh width="13" height="13" />
              Cofnij
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            loading={isSaving}
            disabled={!dirty || isSaving}
          >
            Zapisz zmiany
          </Button>
        </div>

        {/* ── 2-column content ── */}
        <div className={styles.content}>
          {/* ── Left column ── */}
          <div className={styles.colForm}>
            {/* Page hero */}
            <header className={styles.pageHero}>
              <Heading variant="display" as="h1">
                Usługi & Cennik
              </Heading>
              <div className={styles.heroSub}>
                <span className={styles.liveChip}>
                  <Text variant="nano" as="span" weight="bold">
                    Widoczne publicznie
                  </Text>
                </span>
                <Text variant="nano" as="span" color="secondary">
                  {activeServices} {activeServices === 1 ? 'usługa' : 'usługi'} ·{' '}
                  {state.addons.length} dodatki
                </Text>
              </div>
            </header>

            {/* Services divider */}
            <div className={styles.sectionDivider}>
              <Text
                variant="nano"
                as="span"
                weight="bold"
                color="secondary"
                className={styles.sectionLabel}
              >
                Usługi
              </Text>
              <span className={styles.sectionDividerLine} />
              <Text variant="nano" as="span" mono color="secondary">
                {activeServices}
              </Text>
            </div>

            {/* Service cards */}
            {state.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                allServices={state.services}
                allAddons={state.addons}
                onChange={(updated) => updateService(service.id, updated)}
                onDelete={() => requestDeleteService(service.id, service.name)}
                onToggle={() => toggleServiceEnabled(service.id)}
                defaultOpen={service.id === newlyCreatedId}
              />
            ))}

            {/* New service block (inline) */}
            {addingService && (
              <NewServiceBlock
                onCreate={handleCreateService}
                onCancel={() => setAddingService(false)}
              />
            )}

            {/* Add service button */}
            {!addingService && (
              <button className={styles.addServiceBtn} onClick={() => setAddingService(true)}>
                <IconPlus width="12" height="12" />
                <Text variant="nano" as="span" weight="bold" color="accent">
                  Dodaj usługę
                </Text>
              </button>
            )}

            {/* Addons divider */}
            <div className={styles.sectionDivider} style={{ paddingTop: '8px' }}>
              <Text
                variant="nano"
                as="span"
                weight="bold"
                color="secondary"
                className={styles.sectionLabel}
              >
                Dodatki
              </Text>
              <span className={styles.sectionDividerLine} />
              <Text variant="nano" as="span" mono color="secondary">
                {state.addons.length}
              </Text>
            </div>

            {/* Addon collection */}
            <AddonCollection
              addons={state.addons}
              onChange={updateAddons}
              onDeleteAddon={requestDeleteAddon}
              onToggleAddon={toggleAddonEnabled}
            />
          </div>

          {/* ── Right column (sticky) ── */}
          <div className={styles.colRight}>
            <SimulationCard services={state.services} addons={state.addons} />
          </div>
        </div>
      </div>
    </>
  );
}
