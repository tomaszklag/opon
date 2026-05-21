'use client';

import { useLoginFlow } from '../../lib/hooks/use-login-flow';
import { PhoneStep } from './_components/PhoneStep';
import { OtpStep } from './_components/OtpStep';
import { LoginFooter } from './_components/LoginFooter';
import { LoginHero } from './_components/LoginHero';
import styles from './login.module.css';

export default function LoginPage() {
  const flow = useLoginFlow();

  if (flow.authLoading || flow.isAuthenticated) return null;

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
              phoneHint={flow.phoneHint}
              isRateLimited={flow.isRateLimited}
              rateLimitTimerLabel={flow.rateLimitTimerLabel}
              onSubmit={flow.handlePhoneSubmit}
              onDigitsChange={flow.handleDigitsChange}
            />
          ) : (
            <OtpStep
              code={flow.code}
              error={flow.error}
              loading={flow.loading}
              otpCountdown={flow.otpCountdown}
              otpTimerLabel={flow.otpTimerLabel}
              isRateLimited={flow.isRateLimited}
              rateLimitTimerLabel={flow.rateLimitTimerLabel}
              clientRoleError={flow.clientRoleError}
              phone={flow.phone}
              onSubmit={flow.handleOtpSubmit}
              onCodeChange={flow.setCode}
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
