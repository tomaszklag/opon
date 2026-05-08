'use client';

import { useState } from 'react';
import { Button, Heading, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useWorkers } from '../../../lib/hooks/use-workers';
import type { Worker } from '../../../lib/hooks/use-workers';
import { WorkerCard } from './_components/WorkerCard';
import { AbsenceTimeline } from './_components/AbsenceTimeline';
import { AddLeaveModal } from './_components/AddLeaveModal';
import { IconPlus } from '../../../components/icons';
import styles from './workers.module.css';

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function isOnLeaveToday(startDate: string, endDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= toDate(startDate) && today <= toDate(endDate);
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((toDate(iso).getTime() - today.getTime()) / 86400000);
}

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
    addLeave,
    updateLeave,
    removeLeave,
  } = useWorkers();

  const [newWorkerId, setNewWorkerId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [addLeaveModal, setAddLeaveModal] = useState<{
    isOpen: boolean;
    workerId?: string;
    editingLeave?: Worker['leaves'][0];
  }>({ isOpen: false });
  const [statusFilter, setStatusFilter] = useState<'all' | 'onLeave' | 'soon'>('all');

  async function handleCreate() {
    setCreating(true);
    try {
      const id = await createWorker(`Nowy pracownik ${workers.length + 1}`);
      setNewWorkerId(id);
    } finally {
      setCreating(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie pracowników…" />
      </div>
    );
  }

  const totalLeaves = workers.reduce((sum, w) => sum + w.leaves.length, 0);

  const onLeaveCount = workers.filter((w) =>
    w.leaves.some((l) => isOnLeaveToday(l.startDate, l.endDate)),
  ).length;

  const soonCount = workers.filter((w) =>
    w.leaves.some((l) => {
      const d = daysUntil(l.startDate);
      return d >= 0 && d <= 30;
    }),
  ).length;

  const filteredWorkers = workers.filter((w) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'onLeave')
      return w.leaves.some((l) => isOnLeaveToday(l.startDate, l.endDate));
    if (statusFilter === 'soon')
      return w.leaves.some((l) => {
        const d = daysUntil(l.startDate);
        return d >= 0 && d <= 30;
      });
    return true;
  });

  return (
    <div className={styles.page}>
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

          {/* Filter pills */}
          {(onLeaveCount > 0 || soonCount > 0) && (
            <div className={styles.filterBar}>
              <button
                className={`${styles.filterPill} ${statusFilter === 'all' ? styles.filterPillActive : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <Text variant="nano" weight="bold" as="span">
                  Wszyscy
                </Text>
              </button>
              {onLeaveCount > 0 && (
                <button
                  className={`${styles.filterPill} ${statusFilter === 'onLeave' ? styles.filterPillActive : ''}`}
                  onClick={() => setStatusFilter('onLeave')}
                >
                  <Text variant="nano" weight="bold" as="span">
                    Na urlopie
                  </Text>
                  <Text variant="nano" mono weight="bold" as="span" className={styles.filterCount}>
                    {onLeaveCount}
                  </Text>
                </button>
              )}
              {soonCount > 0 && (
                <button
                  className={`${styles.filterPill} ${statusFilter === 'soon' ? styles.filterPillActive : ''}`}
                  onClick={() => setStatusFilter('soon')}
                >
                  <Text variant="nano" weight="bold" as="span">
                    Wkrótce
                  </Text>
                  <Text variant="nano" mono weight="bold" as="span" className={styles.filterCount}>
                    {soonCount}
                  </Text>
                </button>
              )}
            </div>
          )}

          {/* Worker cards */}
          {filteredWorkers.map((worker) => {
            const index = workers.indexOf(worker);
            return (
              <WorkerCard
                key={worker.id}
                worker={worker}
                index={index}
                saving={saving}
                defaultOpen={worker.id === newWorkerId}
                onUpdate={(patch) => updateWorker(worker.id, patch)}
                onDelete={() => deleteWorker(worker.id)}
                onAddLeave={(leave) => addLeave(worker.id, leave)}
                onEditLeave={(leave) =>
                  setAddLeaveModal({ isOpen: true, workerId: worker.id, editingLeave: leave })
                }
                onRemoveLeave={(leaveId) => removeLeave(worker.id, leaveId)}
              />
            );
          })}

          {/* Add worker button */}
          <button
            type="button"
            className={styles.addWorkerBtn}
            onClick={handleCreate}
            disabled={creating || saving}
          >
            <IconPlus width="12" height="12" />
            <Text variant="nano" as="span" weight="bold" color="accent">
              Dodaj pracownika
            </Text>
          </button>
        </div>

        {/* Full-width timeline */}
        <AbsenceTimeline
          workers={workers}
          onRequestAddLeave={(workerId) => setAddLeaveModal({ isOpen: true, workerId })}
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
