'use client';

import { useRegisterFlow } from '../../lib/hooks/use-register-flow';
import { StepsIndicator } from './_components/StepsIndicator';
import { FirmStep } from './_components/FirmStep';
import { ConfirmStep } from './_components/ConfirmStep';
import styles from './register.module.css';

export default function RegisterPage() {
  const flow = useRegisterFlow();

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>opony.app</div>

        <StepsIndicator step={flow.step} />

        {flow.step === 'firm' ? (
          <FirmStep
            data={flow.data}
            error={flow.error}
            onSubmit={flow.handleFirmNext}
            setField={flow.setField}
            setNip={flow.setNip}
            setPostalCode={flow.setPostalCode}
          />
        ) : (
          <ConfirmStep
            data={flow.data}
            error={flow.error}
            loading={flow.loading}
            onSubmit={flow.handleSubmit}
            onGoBack={flow.goBack}
          />
        )}
      </div>
    </div>
  );
}
