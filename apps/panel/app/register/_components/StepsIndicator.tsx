import styles from '../register.module.css';

interface Props {
  step: 'firm' | 'confirm';
}

export function StepsIndicator({ step }: Props) {
  return (
    <div className={styles.steps}>
      <div className={`${styles.step} ${step === 'firm' ? styles.stepActive : styles.stepDone}`}>
        <span className={styles.stepNum}>1</span>
        <span>Dane firmy</span>
      </div>
      <div className={styles.stepLine} />
      <div className={`${styles.step} ${step === 'confirm' ? styles.stepActive : ''}`}>
        <span className={styles.stepNum}>2</span>
        <span>Potwierdzenie</span>
      </div>
    </div>
  );
}
