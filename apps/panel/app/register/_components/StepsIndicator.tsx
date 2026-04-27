import styles from '../register.module.css';

const STEPS = ['Firma', 'Zdjęcia', 'Weryfikacja'];

interface Props {
  currentStep?: 1 | 2 | 3;
}

export function StepsIndicator({ currentStep = 1 }: Props) {
  return (
    <div
      className={styles.stepperBar}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={currentStep}
      aria-label={`Krok ${currentStep} z 3: ${STEPS[currentStep - 1]}`}
    >
      {STEPS.flatMap((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const stepClass = [
          styles.step,
          isActive ? styles.stepActive : '',
          isDone ? styles.stepDone : '',
        ]
          .filter(Boolean)
          .join(' ');

        const elements = [];

        if (i > 0) {
          elements.push(
            <span
              key={`connector-${i}`}
              className={`${styles.stepConnector} ${isDone ? styles.stepConnectorDone : ''}`}
            />,
          );
        }

        elements.push(
          <div key={label} className={stepClass}>
            <span className={styles.stepNum}>{stepNum}</span>
            <span className={styles.stepLabel}>{label}</span>
          </div>,
        );

        return elements;
      })}
    </div>
  );
}
