'use client';

import {
  Button,
  Heading,
  Input,
  Modal,
  NoticeBlock,
  Spinner,
  Text,
} from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { useServiceConfigs } from '../../../lib/hooks/use-service-configs';
import {
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_ORDER,
  type ServiceType,
} from '../../../api-data-access/service-configs';
import { IconRefresh } from '../../../components/icons';
import styles from './services.module.css';

const SERVICE_HINTS: Record<ServiceType, string> = {
  SEASONAL_SWAP: 'Zazwyczaj 45–60 min z montażem TPMS',
  WHEEL_SWAP: 'Zazwyczaj 30–40 min',
  BALANCING: 'Zazwyczaj 15–25 min',
  PUNCTURE_REPAIR: 'Zazwyczaj 20–30 min',
};

export default function ServicesPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');
  const {
    configs,
    loading,
    saving,
    saved,
    dirty,
    loadError,
    saveError,
    updateDuration,
    revert,
    save,
  } = useServiceConfigs();

  const {
    showModal: showNavWarning,
    confirm: confirmNav,
    cancel: cancelNav,
  } = useNavigationGuard(dirty);

  if (authLoading || loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie konfiguracji usług…" />
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
          Masz niezapisane zmiany w konfiguracji usług. Jeśli opuścisz tę stronę, zmiany zostaną
          utracone.
        </Text>
      </Modal>

      <div className={styles.page}>
        {/* Action bar */}
        <div className={styles.actionBar}>
          {dirty && (
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
            <Button variant="ghost" size="sm" onClick={revert} disabled={saving}>
              <IconRefresh width="13" height="13" />
              Cofnij
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={save}
            loading={saving}
            disabled={!dirty || saving}
          >
            Zapisz zmiany
          </Button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <header className={styles.pageHero}>
            <Heading variant="display" as="h1">
              Usługi
            </Heading>
            <Text variant="body-sm" as="p" color="secondary" className={styles.pageDesc}>
              Czas trwania usług — ustaw domyślny czas trwania każdego rodzaju usługi. System
              rezerwacji używa tych wartości do planowania slotów.
            </Text>
          </header>

          {/* Error banner */}
          {(loadError ?? saveError) && (
            <Text variant="body-sm" as="p" color="danger" className={styles.errorBanner}>
              {loadError ?? saveError}
            </Text>
          )}

          {/* Success notice */}
          {saved && !dirty && (
            <NoticeBlock variant="success">Konfiguracja usług została zapisana.</NoticeBlock>
          )}

          {/* Service list */}
          <div className={styles.serviceList}>
            {SERVICE_TYPE_ORDER.map((serviceType) => {
              const config = configs.find((c) => c.serviceType === serviceType);
              const duration = config?.durationMinutes ?? 30;
              return (
                <div key={serviceType} className={styles.serviceCard}>
                  <div className={styles.serviceInfo}>
                    <Text variant="body-sm" as="span" weight="bold">
                      {SERVICE_TYPE_LABELS[serviceType]}
                    </Text>
                    <Text variant="nano" as="span" color="muted" className={styles.serviceHint}>
                      {SERVICE_HINTS[serviceType]}
                    </Text>
                  </div>

                  <div className={styles.durationGroup}>
                    <Input
                      type="number"
                      min={5}
                      max={240}
                      step={5}
                      value={duration}
                      onChange={(e) =>
                        updateDuration(
                          serviceType,
                          Math.max(5, Math.min(240, Number(e.target.value))),
                        )
                      }
                      aria-label={`Czas trwania: ${SERVICE_TYPE_LABELS[serviceType]}`}
                      className={styles.durationInput}
                    />
                    <Text variant="body-sm" as="span" color="secondary">
                      min
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
