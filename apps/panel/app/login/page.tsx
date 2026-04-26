'use client';

import { useLoginFlow } from '../../lib/hooks/use-login-flow';
import { PhoneStep } from './_components/PhoneStep';
import { OtpStep } from './_components/OtpStep';
import { LoginFooter } from './_components/LoginFooter';
import { LoginHero } from './_components/LoginHero';
import styles from './login.module.css';

export default function LoginPage() {
  const flow = useLoginFlow();

  if (flow.authLoading) return null;

  return (
    <div className={styles.page}>
      <section className={styles.formSide} aria-labelledby="login-title">
        <div className={styles.brandRow}>
          <span className={styles.wordmark}>
            OPONY
            <span className={styles.dot} aria-hidden="true" />
          </span>
          <span className={styles.panelTag}>Panel warsztatu</span>
        </div>

        <div className={styles.formFrame}>
          {flow.step === 'phone' ? (
            <PhoneStep
              digits={flow.digits}
              error={flow.error}
              loading={flow.loading}
              onSubmit={flow.handlePhoneSubmit}
              onDigitsChange={flow.handleDigitsChange}
            />
          ) : (
            <OtpStep
              cells={flow.cells}
              error={flow.error}
              loading={flow.loading}
              code={flow.code}
              countdown={flow.countdown}
              timerLabel={flow.timerLabel}
              phone={flow.phone}
              otpRefs={flow.otpRefs}
              onSubmit={flow.handleOtpSubmit}
              onCellChange={flow.handleCellChange}
              onCellKeyDown={flow.handleCellKeyDown}
              onCellPaste={flow.handleCellPaste}
              onResend={flow.handleResend}
              onGoToPhone={flow.goToPhone}
            />
          )}
        </div>

        <LoginFooter />
      </section>

      <LoginHero />
    </div>
  );
}
