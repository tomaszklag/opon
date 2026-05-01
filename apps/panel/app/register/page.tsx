'use client';

import Link from 'next/link';
import { StepIndicator, Text } from '@opony/design-system-web';
import { useRegisterFlow } from '../../lib/hooks/use-register-flow';
import { useAuthGuard } from '../../lib/hooks/use-auth-guard';
import { FirmStep } from './_components/FirmStep';
import styles from './register.module.css';

const REGISTER_STEPS = [
  { label: 'Firma', status: 'active' as const },
  { label: 'Zdjęcia', status: 'upcoming' as const },
  { label: 'Weryfikacja', status: 'upcoming' as const },
];

export default function RegisterPage() {
  const { isLoading: authLoading } = useAuthGuard('/register');
  const flow = useRegisterFlow();

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top strip */}
      <header className={styles.topStrip}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandWordmark}>
            OPONY
            <span className={styles.brandDot} />
          </span>
          <Text variant="nano" as="span" className={styles.panelTag}>
            PANEL
          </Text>
        </Link>
        <span className={styles.topStripSpacer} />
        <Text variant="caption" as="span" className={styles.loginLink}>
          Masz już konto?
          <Link className={styles.loginLinkAnchor} href="/login">
            Zaloguj się →
          </Link>
        </Text>
      </header>

      {/* Saving strip */}
      {flow.form.formState.isSubmitting && (
        <div className={styles.savingStrip} role="status" aria-live="polite">
          <span className={styles.savingPulse} aria-hidden="true" />
          Szkic zapisany automatycznie
        </div>
      )}

      {/* Stepper */}
      <div className={styles.stepperBar}>
        <StepIndicator steps={REGISTER_STEPS} />
      </div>

      {/* Form scroll area */}
      <div className={styles.formScroll}>
        <FirmStep flow={flow} />
      </div>
    </div>
  );
}
