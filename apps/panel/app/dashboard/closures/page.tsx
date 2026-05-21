'use client';

import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useScheduleExceptions } from '../../../lib/hooks/use-schedule-exceptions';
import { ExceptionsPanel } from '../stations/_components/ExceptionsPanel';
import { Spinner } from '@opony/design-system-web';
import styles from './closures.module.css';

export default function ClosuresPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { exceptions, loading, saving, error, addException, removeException } =
    useScheduleExceptions();

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie…" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <ExceptionsPanel
          exceptions={exceptions}
          loading={loading}
          saving={saving}
          error={error}
          onAdd={addException}
          onRemove={removeException}
        />
      </div>
    </div>
  );
}
