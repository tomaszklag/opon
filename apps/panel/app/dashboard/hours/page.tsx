'use client';

import { Heading, Text } from '@opony/design-system-web';
import { useWorkingHours } from '../../../lib/hooks/use-working-hours';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { HoursActionBar } from './_components/HoursActionBar';
import { DayList } from './_components/DayList';
import { WeekTimeline } from './_components/WeekTimeline';
import styles from './hours.module.css';

export default function HoursPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const { days, loading, saving, saved, errors, updateDay, save } = useWorkingHours();

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  const todayDow = new Date().getDay();

  return (
    <div className={styles.page}>
      <HoursActionBar saved={saved} saving={saving} onSave={save} />

      <div className={styles.content}>
        <div className={styles.formCol}>
          <header className={styles.pageHero}>
            <Heading variant="display" as="h1" className={styles.pageTitle}>
              Godziny pracy
            </Heading>
            <Text variant="body-md" as="p" className={styles.pageSub}>
              Ustaw dni i godziny przyjęć klientów. Slot to czas jednej rezerwowanej wizyty.
            </Text>
          </header>

          <DayList days={days} errors={errors} todayDow={todayDow} onUpdate={updateDay} />
        </div>

        <WeekTimeline days={days} todayDow={todayDow} />
      </div>
    </div>
  );
}
