'use client';

import { useState } from 'react';
import { Heading, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useWorkers } from '../../../lib/hooks/use-workers';
import { WorkerCard } from './_components/WorkerCard';
import { AddWorkerForm } from './_components/AddWorkerForm';
import { AbsenceTimeline } from './_components/AbsenceTimeline';
import { IconPlus } from '../../../components/icons';
import styles from './workers.module.css';

export default function WorkersPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    workers,
    loading,
    saving,
    error,
    expandedId,
    setExpandedId,
    createWorker,
    updateWorker,
    deleteWorker,
    addLeave,
    removeLeave,
  } = useWorkers();

  const [showAddForm, setShowAddForm] = useState(false);

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie pracowników…" />
      </div>
    );
  }

  const totalLeaves = workers.reduce((sum, w) => sum + w.leaves.length, 0);

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
          </header>

          {/* Worker cards */}
          {workers.map((worker, index) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              index={index}
              isExpanded={expandedId === worker.id}
              saving={saving}
              onToggle={() => setExpandedId(expandedId === worker.id ? null : worker.id)}
              onUpdate={(patch) => updateWorker(worker.id, patch)}
              onDelete={() => deleteWorker(worker.id)}
              onAddLeave={(leave) => addLeave(worker.id, leave)}
              onRemoveLeave={(leaveId) => removeLeave(worker.id, leaveId)}
            />
          ))}

          {/* Add worker */}
          {showAddForm ? (
            <AddWorkerForm
              saving={saving}
              onAdd={async (name, role) => {
                await createWorker(name, role);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          ) : (
            <button
              type="button"
              className={styles.addWorkerTrigger}
              onClick={() => setShowAddForm(true)}
            >
              <IconPlus width="14" height="14" />
              <Text variant="body-sm" as="span" weight="bold" color="accent">
                Dodaj pracownika
              </Text>
            </button>
          )}
        </div>

        {/* Right panel */}
        <div className={styles.previewCol}>
          <AbsenceTimeline workers={workers} />
        </div>
      </div>
    </div>
  );
}
