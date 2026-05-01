'use client';

import { Button, Heading, Modal, Spinner, Text } from '@opony/design-system-web';
import { useWorkingHours } from '../../../lib/hooks/use-working-hours';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { HoursActionBar } from './_components/HoursActionBar';
import { SlotSizeSection } from './_components/SlotSizeSection';
import { DayList } from './_components/DayList';
import { ExceptionsSection } from './_components/ExceptionsSection';
import { WeekTimeline } from './_components/WeekTimeline';
import { IconCopy } from '../../../components/icons';
import styles from './hours.module.css';

export default function HoursPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    days,
    defaultSlotMinutes,
    loading,
    saving,
    saved,
    dirty,
    errors,
    loadError,
    saveError,
    updateDay,
    updateDefaultSlot,
    applyDefaultSlotToAll,
    copyDayToAll,
    toggleBlocks,
    updateBlock,
    addBlock,
    removeBlock,
    revert,
    save,
  } = useWorkingHours();

  const {
    showModal: showNavWarning,
    confirm: confirmNav,
    cancel: cancelNav,
  } = useNavigationGuard(dirty);

  const todayDow = new Date().getDay();

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie godzin pracy…" />
      </div>
    );
  }

  const mondayDay = days.find((d) => d.dayOfWeek === 1);

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
          Masz niezapisane zmiany w godzinach pracy. Jeśli opuścisz tę stronę, zmiany zostaną
          utracone.
        </Text>
      </Modal>

      <div className={styles.page}>
        <HoursActionBar
          dirty={dirty}
          saved={saved}
          saving={saving}
          onSave={save}
          onRevert={revert}
        />

        {(loadError ?? saveError) && (
          <Text variant="body-sm" as="p" className={styles.errorBanner}>
            {loadError ?? saveError}
          </Text>
        )}

        <div className={styles.content}>
          <div className={styles.formCol}>
            <header className={styles.pageHero}>
              <div>
                <Heading variant="display" as="h1">
                  Godziny pracy
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
                    {defaultSlotMinutes} min · domyślnie
                  </Text>
                  <Text variant="body-sm" as="span" color="secondary">
                    {days.filter((d) => !d.isClosed).length} dni aktywnych
                  </Text>
                </div>
              </div>
              {mondayDay && !mondayDay.isClosed && (
                <Button variant="ghost" size="sm" onClick={() => copyDayToAll(1)}>
                  <IconCopy width="12" height="12" />
                  Skopiuj Pon do wszystkich
                </Button>
              )}
            </header>

            <SlotSizeSection
              defaultSlotMinutes={defaultSlotMinutes}
              onUpdate={updateDefaultSlot}
              onApplyToAll={applyDefaultSlotToAll}
            />

            <DayList
              days={days}
              defaultSlotMinutes={defaultSlotMinutes}
              errors={errors}
              todayDow={todayDow}
              onUpdate={updateDay}
              onCopyToAll={copyDayToAll}
              onToggleBlocks={toggleBlocks}
              onUpdateBlock={updateBlock}
              onAddBlock={addBlock}
              onRemoveBlock={removeBlock}
            />

            <ExceptionsSection />
          </div>

          <WeekTimeline days={days} defaultSlotMinutes={defaultSlotMinutes} todayDow={todayDow} />
        </div>
      </div>
    </>
  );
}
