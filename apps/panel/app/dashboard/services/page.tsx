'use client';

import { useState } from 'react';
import { Button, Heading, Modal, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { useServicesPage } from '../../../lib/hooks/use-services-page';
import { IconBolt, IconPlus, IconRefresh, IconInfo } from '../../../components/icons';
import { ServiceGroupCard } from './_components/ServiceGroupCard';
import { SurchargeList } from './_components/SurchargeList';
import { NewServiceBlock } from './_components/NewServiceBlock';
import type { PricingMode, ServiceGroupState, SurchargeState } from './_types';
import styles from './services.module.css';

export default function ServicesPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { state, isLoading, isSaving, saveError, dirty, saved, updateState, revert, save } =
    useServicesPage();
  const [addingService, setAddingService] = useState(false);

  const { showModal, confirm: confirmNav, cancel: cancelNav } = useNavigationGuard(dirty);

  function updateGroups(groups: ServiceGroupState[]) {
    updateState((prev) => ({ ...prev, groups }));
  }

  function updateSurcharges(surcharges: SurchargeState[]) {
    updateState((prev) => ({ ...prev, surcharges }));
  }

  function updateGroup(groupId: string, updated: ServiceGroupState) {
    updateGroups(state.groups.map((g) => (g.id === groupId ? updated : g)));
  }

  function handleCreateService(name: string, pricingMode: PricingMode) {
    const newGroup: ServiceGroupState = {
      id: Math.random().toString(36).slice(2),
      name,
      pricingMode,
      sortOrder: state.groups.length,
      variants: [],
    };
    updateGroups([...state.groups, newGroup]);
    setAddingService(false);
  }

  if (authLoading || isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie…" />
      </div>
    );
  }

  const totalVariants = state.groups.reduce((acc, g) => acc + g.variants.length, 0);
  const activeVariants = state.groups.reduce(
    (acc, g) => acc + g.variants.filter((v) => v.enabled).length,
    0,
  );
  const activeSurcharges = state.surcharges.filter((s) => s.enabled).length;

  return (
    <>
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
                  {activeVariants} usług · {activeSurcharges} dopłaty aktywne
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
                {state.groups.length} {state.groups.length === 1 ? 'grupa' : 'grupy'} ·{' '}
                {totalVariants} wariantów
              </Text>
            </div>

            {/* Service groups */}
            {state.groups.map((group) => (
              <ServiceGroupCard
                key={group.id}
                group={group}
                onChange={(updated) => updateGroup(group.id, updated)}
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

            {/* Surcharges divider */}
            <div className={styles.sectionDivider} style={{ paddingTop: '8px' }}>
              <span className={styles.sectionLabelPurple}>
                <Text variant="nano" as="span" weight="bold" className={styles.sectionLabel}>
                  Dopłaty
                </Text>
              </span>
              <span className={styles.sectionDividerLinePurple} />
              <span className={styles.sectionLabelPurple}>
                <Text variant="nano" as="span" mono>
                  {activeSurcharges} aktywne · doliczane auto
                </Text>
              </span>
            </div>

            {/* Surcharges */}
            <SurchargeList surcharges={state.surcharges} onChange={updateSurcharges} />
          </div>

          {/* ── Right column (sticky) ── */}
          <div className={styles.colRight}>
            {/* Help card 1 — sub-services inherit/override */}
            <div className={styles.helpCard}>
              <div className={styles.helpHdr}>
                <IconInfo width="10" height="10" style={{ color: 'var(--text-muted)' }} />
                <Text variant="nano" as="span" weight="bold" color="secondary">
                  Pod-usługi — inherit / override
                </Text>
              </div>
              <div className={styles.helpBody}>
                <div className={styles.helpRow}>
                  <InheritIcon />
                  <Text variant="nano" as="p" color="secondary">
                    <strong>jak usł.</strong> — domyślny stan. Pod-usługa dziedziczy cenę i czas z
                    usługi głównej. Nie musisz nic konfigurować.
                  </Text>
                </div>
                <div className={styles.helpRow}>
                  <OverrideOpenIcon />
                  <Text variant="nano" as="p" color="secondary">
                    <strong style={{ color: 'var(--accent)' }}>Otwarta kłódka</strong> — override
                    aktywny. Pod-usługa ma własną cenę i czas — niezależne od usługi głównej.
                  </Text>
                </div>
                <div className={styles.helpRow}>
                  <span className={styles.helpDot} style={{ background: 'var(--success)' }} />
                  <Text variant="nano" as="p" color="secondary">
                    <strong>Wliczone</strong> — cena zawsze &quot;wliczone&quot;. Kliknij kłódkę
                    żeby ustawić własny dodatkowy czas (domyślnie +0 min).
                  </Text>
                </div>
              </div>
            </div>

            {/* Help card 2 — surcharges */}
            <div className={`${styles.helpCard} ${styles.helpCardPurple}`}>
              <div className={`${styles.helpHdr} ${styles.helpHdrPurple}`}>
                <IconBolt
                  width="10"
                  height="10"
                  style={{ color: 'var(--purple)', flexShrink: 0 }}
                />
                <span className={styles.sectionLabelPurple}>
                  <Text variant="nano" as="span" weight="bold">
                    Dopłaty do usług
                  </Text>
                </span>
              </div>
              <div className={styles.helpBody}>
                <div className={styles.helpRow}>
                  <span className={styles.helpDot} style={{ background: 'var(--purple)' }} />
                  <Text variant="nano" as="p" color="secondary">
                    Klient zaznacza cechy pojazdu przy rezerwacji. Doliczane automatycznie.
                  </Text>
                </div>
                <div className={styles.helpRow}>
                  <span className={styles.helpDot} style={{ background: 'var(--border-strong)' }} />
                  <Text variant="nano" as="p" color="secondary">
                    &quot;Per koło&quot; → ×4. &quot;Per sensor&quot; → ×4–5. Zakres klikalny —
                    można zmienić.
                  </Text>
                </div>
              </div>
            </div>

            {/* Simulation card (static) */}
            <div className={styles.simCard}>
              <div className={styles.simHdr}>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.2"
                  aria-hidden="true"
                >
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v5" />
                  <circle cx="16" cy="17" r="3" />
                  <circle cx="8" cy="17" r="3" />
                </svg>
                <div>
                  <Heading variant="subsection" as="span">
                    Symulacja
                  </Heading>
                  <Text
                    variant="nano"
                    as="div"
                    color="secondary"
                    mono
                    className={styles.simSubLabel}
                  >
                    Osobowe · R15 · Run-Flat
                  </Text>
                </div>
              </div>
              <div className={styles.simBody}>
                <div className={styles.simSteps}>
                  <Text variant="nano" as="span" weight="bold" color="primary">
                    Osobowe
                  </Text>
                  <Text variant="nano" as="span" color="secondary">
                    →
                  </Text>
                  <Text variant="nano" as="span" weight="bold" color="primary">
                    Wymiana sez.
                  </Text>
                  <Text variant="nano" as="span" color="secondary">
                    →
                  </Text>
                  <Text variant="nano" as="span" weight="bold" color="primary">
                    R15
                  </Text>
                  <Text variant="nano" as="span" color="secondary">
                    →
                  </Text>
                  <span className={styles.sectionLabelPurple}>
                    <Text variant="nano" as="span" weight="bold">
                      Run-Flat ✓
                    </Text>
                  </span>
                </div>
                <div className={styles.simDivider} />
                <div className={`${styles.simRow} ${styles.simRowBase}`}>
                  <div className={styles.simLabel}>
                    <Text variant="nano" as="span" color="secondary">
                      Wymiana sezonowa — R13-15
                    </Text>
                    <Text variant="nano" as="span" color="secondary" mono>
                      {' '}
                      40 min baza
                    </Text>
                  </div>
                  <Text variant="nano" as="span" mono weight="bold">
                    180 zł
                  </Text>
                </div>
                <div className={`${styles.simRow} ${styles.simRowIncl}`}>
                  <div className={styles.simLabel}>
                    <svg
                      width="7"
                      height="7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <Text variant="nano" as="span" color="secondary">
                      Wyważanie (wliczone, inherit)
                    </Text>
                    <Text variant="nano" as="span" color="secondary" mono>
                      +0 min
                    </Text>
                  </div>
                  <span className={styles.simSuccessText}>
                    <Text variant="nano" as="span" mono weight="bold">
                      — wlicz.
                    </Text>
                  </span>
                </div>
                <div className={`${styles.simRow} ${styles.simRowOpt}`}>
                  <div className={styles.simLabel}>
                    <Text variant="nano" as="span" color="secondary">
                      + Nowy wentyl (własna)
                    </Text>
                    <Text variant="nano" as="span" color="secondary" mono>
                      +5 min
                    </Text>
                  </div>
                  <Text variant="nano" as="span" mono weight="bold" color="accent">
                    +10 zł
                  </Text>
                </div>
                <div className={`${styles.simRow} ${styles.simRowSurcharge}`}>
                  <div className={styles.simLabel}>
                    <Text variant="nano" as="span" color="secondary">
                      + Run-Flat (4×20 zł)
                    </Text>
                  </div>
                  <span className={styles.sectionLabelPurple}>
                    <Text variant="nano" as="span" mono weight="bold">
                      +80 zł
                    </Text>
                  </span>
                </div>
                <div className={styles.simTotal}>
                  <div>
                    <Text variant="nano" as="div" weight="bold" color="secondary">
                      Do zapłaty
                    </Text>
                    <Text variant="nano" as="div" color="secondary" mono>
                      10:00 → 10:45 · 45 min łącznie
                    </Text>
                  </div>
                  <Heading variant="subsection" as="span" color="accent">
                    270 zł
                  </Heading>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InheritIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-muted)"
      strokeWidth="2.2"
      strokeLinecap="round"
      style={{ flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function OverrideOpenIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--accent)"
      strokeWidth="2.3"
      strokeLinecap="round"
      style={{ flexShrink: 0, marginTop: 2 }}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
