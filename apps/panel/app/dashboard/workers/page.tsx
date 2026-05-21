'use client';

import { useState } from 'react';
import { Button, Heading, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useWorkers } from '../../../lib/hooks/use-workers';
import type { Worker } from '../../../lib/hooks/use-workers';
import { useStations } from '../../../lib/hooks/use-stations';
import { stationsApi } from '../../../api-data-access/stations';
import { AbsenceTimeline } from './_components/AbsenceTimeline';
import { AddLeaveModal } from './_components/AddLeaveModal';
import { IconPlus } from '../../../components/icons';
import styles from './workers.module.css';

export default function WorkersPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    workers,
    loading,
    saving,
    error,
    createWorker,
    updateWorker,
    deleteWorker,
    patchWorkerStations,
    addLeave,
    updateLeave,
  } = useWorkers();

  const { stations, loading: stationsLoading } = useStations();

  const [addLeaveModal, setAddLeaveModal] = useState<{
    isOpen: boolean;
    workerId?: string;
    editingLeave?: Worker['leaves'][0];
  }>({ isOpen: false });

  if (authLoading || loading || stationsLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie pracowników…" />
      </div>
    );
  }

  const totalLeaves = workers.reduce((sum, w) => sum + w.leaves.length, 0);

  async function handleAssignStation(workerId: string, stationId: string) {
    await stationsApi.assignWorker(stationId, { workerId });
    const station = stations.find((s) => s.id === stationId);
    const worker = workers.find((w) => w.id === workerId);
    if (station && worker) {
      patchWorkerStations(workerId, [
        ...worker.stations,
        { stationId: station.id, stationName: station.name, shiftStart: null, shiftEnd: null },
      ]);
    }
  }

  async function handleRemoveStation(workerId: string, stationId: string) {
    await stationsApi.removeWorker(stationId, workerId);
    const worker = workers.find((w) => w.id === workerId);
    if (worker) {
      patchWorkerStations(
        workerId,
        worker.stations.filter((s) => s.stationId !== stationId),
      );
    }
  }

  return (
    <div className={styles.page}>
      {error && (
        <Text variant="body-sm" as="p" className={styles.errorBanner}>
          {error}
        </Text>
      )}

      <div className={styles.content}>
        {/* Page hero */}
        <header className={styles.pageHero}>
          <div>
            <Heading variant="display" as="h1">
              Pracownicy
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
                {workers.length}{' '}
                {workers.length === 1
                  ? 'pracownik'
                  : workers.length < 5
                    ? 'pracownicy'
                    : 'pracowników'}
              </Text>
              {totalLeaves > 0 && (
                <Text variant="body-sm" as="span" color="secondary">
                  {totalLeaves} zaplanowanych urlopów
                </Text>
              )}
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAddLeaveModal({ isOpen: true })}>
            <IconPlus width="12" height="12" />
            Dodaj nieobecność
          </Button>
        </header>

        <AbsenceTimeline
          workers={workers}
          stations={stations}
          saving={saving}
          onRequestAddLeave={(workerId) => setAddLeaveModal({ isOpen: true, workerId })}
          onUpdateWorker={(id, patch) => updateWorker(id, patch)}
          onCreateWorker={(name, role) => createWorker(name, role).then(() => {})}
          onDeleteWorker={(id) => deleteWorker(id)}
          onAssignStation={handleAssignStation}
          onRemoveStation={handleRemoveStation}
        />
      </div>

      <AddLeaveModal
        isOpen={addLeaveModal.isOpen}
        onClose={() => setAddLeaveModal({ isOpen: false })}
        workers={workers}
        defaultWorkerId={addLeaveModal.workerId}
        editingLeave={
          addLeaveModal.editingLeave
            ? {
                leaveId: addLeaveModal.editingLeave.id,
                type: addLeaveModal.editingLeave.type,
                startDate: addLeaveModal.editingLeave.startDate,
                endDate: addLeaveModal.editingLeave.endDate,
                note: addLeaveModal.editingLeave.note,
              }
            : undefined
        }
        saving={saving}
        onAddLeave={async (workerId, leave) => {
          await addLeave(workerId, leave);
          setAddLeaveModal({ isOpen: false });
        }}
        onUpdateLeave={async (workerId, leaveId, leave) => {
          await updateLeave(workerId, leaveId, leave);
          setAddLeaveModal({ isOpen: false });
        }}
      />
    </div>
  );
}
