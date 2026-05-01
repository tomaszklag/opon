'use client';
import { Text } from '@opony/design-system-web';
import styles from '../profile.module.css';

interface Props {
  state: 'idle' | 'saving' | 'saved';
  savedAt: Date | null;
}

function secondsAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 1000);
}

export function AutosavePill({ state, savedAt }: Props) {
  if (state === 'idle') return null;

  const label =
    state === 'saving'
      ? 'Zapisuję…'
      : savedAt != null
        ? `Zapisano · ${secondsAgo(savedAt)}s temu`
        : 'Zapisano';

  return (
    <span className={styles.autosavePill}>
      <span
        className={[styles.autosaveDot, state === 'saving' ? styles.autosaveDotPulsing : '']
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
      />
      <Text variant="nano" as="span" mono weight="bold">
        {label}
      </Text>
    </span>
  );
}
