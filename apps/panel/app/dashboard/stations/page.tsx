'use client';

import { useState } from 'react';
import { Button, Heading, Modal, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { useStations } from '../../../lib/hooks/use-stations';
import { type ServiceType, type DaySchedule } from '../../../api-data-access/stations';
import { StationsActionBar } from './_components/StationsActionBar';
import { StationsEmptyState } from './_components/StationsEmptyState';
import { StationCard } from './_components/StationCard';
import { StationsPreview } from './_components/StationsPreview';
import { IconPlus } from '../../../components/icons';
import styles from './stations.module.css';

// All services are considered "available" until we have a pricing API integration
const ALL_SERVICES: ServiceType[] = ['SEASONAL_SWAP', 'WHEEL_SWAP', 'BALANCING', 'PUNCTURE_REPAIR'];

export default function StationsPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    stations,
    loading,
    saving,
    saved,
    dirty,
    error,
    createStation,
    updateStation,
    deleteStation,
    removeWorker,
    updateStationLocal,
    revert,
  } = useStations();

  const {
    showModal: showNavWarning,
    confirm: confirmNav,
    cancel: cancelNav,
  } = useNavigationGuard(dirty);

  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    setCreating(true);
    const count = stations.length + 1;
    await createStation(`Stanowisko ${count}`);
    setCreating(false);
  }

  function handleSave() {
    // For stations, each mutation is directly saved via API.
    // The "save" here is a no-op if all local changes have been pushed.
    // This button resets dirty state if somehow it's still set.
    revert();
  }

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie stanowisk…" />
      </div>
    );
  }

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
          Masz niezapisane zmiany w stanowiskach. Jeśli opuścisz tę stronę, zmiany zostaną utracone.
        </Text>
      </Modal>

      <div className={styles.page}>
        <StationsActionBar
          dirty={dirty}
          saved={saved}
          saving={saving}
          onSave={handleSave}
          onRevert={revert}
        />

        {error && (
          <Text variant="body-sm" as="p" className={styles.errorBanner}>
            {error}
          </Text>
        )}

        <div className={styles.content}>
          <div className={styles.formCol}>
            {/* Page hero */}
            <header className={styles.pageHero}>
              <div>
                <Heading variant="display" as="h1">
                  Stanowiska
                </Heading>
                <div className={styles.pageSubRow}>
                  <Text
                    variant="nano"
                    as="span"
                    mono
                    weight="bold"
                    className={styles.statPill}
                    color="accent"
                  >
                    {stations.length}{' '}
                    {stations.length === 1
                      ? 'stanowisko'
                      : stations.length < 5
                        ? 'stanowiska'
                        : 'stanowisk'}
                  </Text>
                  <Text variant="body-sm" as="span" color="secondary">
                    Capacity zarządzana przez stanowiska
                  </Text>
                </div>
              </div>
            </header>

            {/* Station list or empty state */}
            {stations.length === 0 ? (
              <StationsEmptyState onCreate={handleCreate} creating={creating} />
            ) : (
              <>
                {stations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    availableServices={ALL_SERVICES}
                    onUpdateName={(name) => {
                      updateStation(station.id, { name });
                    }}
                    onToggleService={(svc) => {
                      const services = station.services.includes(svc)
                        ? station.services.filter((s) => s !== svc)
                        : [...station.services, svc];
                      updateStation(station.id, { services });
                    }}
                    onUpdateSchedule={(schedule: DaySchedule[]) => {
                      updateStationLocal(station.id, { schedule });
                    }}
                    onRemoveWorker={(workerId) => {
                      removeWorker(station.id, workerId);
                    }}
                    onDelete={() => {
                      deleteStation(station.id);
                    }}
                  />
                ))}

                {/* Add station button */}
                <button
                  className={styles.addStationBtn}
                  onClick={handleCreate}
                  disabled={creating || saving}
                >
                  <IconPlus width="14" height="14" />
                  Dodaj stanowisko
                </button>
              </>
            )}
          </div>

          {/* Right preview column */}
          <div className={styles.previewCol}>
            <StationsPreview stations={stations} />
          </div>
        </div>
      </div>
    </>
  );
}
