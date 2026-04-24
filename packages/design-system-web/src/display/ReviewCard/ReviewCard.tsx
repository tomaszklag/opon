import React from 'react';
import styles from './ReviewCard.module.css';
import { VerifiedBadge } from '../VerifiedBadge/VerifiedBadge';

export interface ReviewReply {
  author: string;
  text: string;
  date?: string;
}

export interface ReviewCardProps {
  authorInitials: string;
  authorName: string;
  verified?: boolean;
  rating: number;
  date?: string;
  text: string;
  reply?: ReviewReply;
  className?: string;
}

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} z ${max} gwiazdek`}>
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={i < rating ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export function ReviewCard({
  authorInitials,
  authorName,
  verified,
  rating,
  date,
  text,
  reply,
  className,
}: ReviewCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {authorInitials}
        </span>
        <div className={styles.metaCol}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{authorName}</span>
            {verified && <VerifiedBadge />}
          </div>
          <div className={styles.sub}>
            <Stars rating={rating} />
            {date && (
              <>
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.date}>{date}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <p className={styles.text}>{text}</p>

      {reply && (
        <div className={styles.reply}>
          <div className={styles.replyHead}>
            <span className={styles.replyLabel}>{reply.author}</span>
            {reply.date && <span className={styles.replyDate}>{reply.date}</span>}
          </div>
          <p className={styles.replyText}>{reply.text}</p>
        </div>
      )}
    </article>
  );
}
