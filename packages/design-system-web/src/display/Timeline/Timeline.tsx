import React from 'react';
import styles from './Timeline.module.css';

export type TimelineEventState = 'done' | 'current' | 'future';

export interface TimelineEvent {
  id: string;
  label: string;
  time?: string;
  sub?: string;
  state: TimelineEventState;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const CheckIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol
      className={[styles.timeline, className].filter(Boolean).join(' ')}
      aria-label="Timeline wydarzeń"
    >
      {events.map((event, i) => (
        <li
          key={event.id}
          className={[
            styles.event,
            styles[event.state],
            i === events.length - 1 ? styles.last : null,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.dot} aria-hidden="true">
            {event.state === 'done' && <CheckIcon />}
          </span>
          <span className={styles.body}>
            <span className={styles.label}>{event.label}</span>
            {event.time && <span className={styles.time}>{event.time}</span>}
            {event.sub && <span className={styles.sub}>{event.sub}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
