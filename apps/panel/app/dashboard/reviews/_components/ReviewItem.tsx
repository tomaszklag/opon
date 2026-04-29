'use client';
import { useState } from 'react';
import { Button, StarRating, Text, Textarea } from '@opony/design-system-web';
import { reviewsApi, type ReviewDto } from '../../../../api-data-access/reviews';
import {
  IconCheck,
  IconFlag,
  IconSearch,
  IconTrash,
  IconPencil,
} from '../../../../components/icons';
import styles from '../reviews.module.css';

const TEMPLATES_POS = ['Dziękujemy za opinię!', 'Polecamy wymianę jesienną', 'Do zobaczenia!'];
const TEMPLATES_NEG = [
  'Przepraszamy za spóźnienie',
  'Wdrożyliśmy bufory czasowe',
  'Zapraszamy z rabatem −10%',
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface ReviewItemProps {
  review: ReviewDto;
  onMutate: () => void;
}

export function ReviewItem({ review, onMutate }: ReviewItemProps) {
  const isNew = !review.seenByProvider;
  const hasPendingReply = !review.providerReply;
  const [editMode, setEditMode] = useState(false);
  const [replyText, setReplyText] = useState(review.providerReply ?? '');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reported, setReported] = useState(review.isReported);

  const showComposer = hasPendingReply || editMode;
  const templates = review.rating >= 4 ? TEMPLATES_POS : TEMPLATES_NEG;

  async function handleSendReply() {
    if (!replyText.trim()) return;
    setSaving(true);
    setActionError(null);
    try {
      await reviewsApi.upsertReply(review.id, replyText.trim());
      setEditMode(false);
      onMutate();
    } catch {
      setActionError('Nie udało się zapisać odpowiedzi. Spróbuj ponownie.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReply() {
    setSaving(true);
    setActionError(null);
    try {
      await reviewsApi.deleteReply(review.id);
      setReplyText('');
      onMutate();
    } catch {
      setActionError('Nie udało się usunąć odpowiedzi.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReport() {
    try {
      await reviewsApi.report(review.id);
      setReported(true);
    } catch {
      /* silent — user sees no change */
    }
  }

  const cardClass = [
    styles.reviewCard,
    isNew ? styles.reviewCardNew : null,
    review.rating <= 3 ? styles.reviewCardCritical : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass}>
      {/* ── head ── */}
      <header className={styles.reviewHead}>
        <span className={styles.reviewAvatar} aria-hidden="true">
          {review.authorInitials}
        </span>

        <div className={styles.reviewMetaCol}>
          <div className={styles.reviewNameRow}>
            <Text variant="body-sm" as="span" weight="bold">
              {review.authorName}
            </Text>
            <span className={styles.verifiedBadge}>
              <IconCheck width="10" height="10" />
              <Text variant="nano" as="span" color="accent">
                Zweryfikowany
              </Text>
            </span>
            {isNew && (
              <span className={styles.newBadge}>
                <Text variant="nano" as="span">
                  NOWE
                </Text>
              </span>
            )}
          </div>

          <div className={styles.reviewSubMeta}>
            <StarRating value={review.rating} readOnly size="sm" />
            <span className={styles.dotSep} aria-hidden="true" />
            <Text variant="body-sm" as="span" color="muted">
              {formatDate(review.createdAt)}
            </Text>
            <span className={styles.dotSep} aria-hidden="true" />
            <Text variant="kicker" as="span" color="muted">
              {review.bookingReferenceCode}
            </Text>
          </div>
        </div>

        <div className={styles.reviewActions}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Szczegóły rezerwacji"
            title="Szczegóły rezerwacji"
          >
            <IconSearch width="14" height="14" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Zgłoś nadużycie"
            title="Zgłoś nadużycie"
            onClick={handleReport}
            disabled={reported}
            className={reported ? styles.reportedBtn : styles.dangerBtn}
          >
            <IconFlag width="14" height="14" />
          </Button>
        </div>
      </header>

      {/* ── review text ── */}
      {review.comment && (
        <Text variant="body" as="p" className={styles.reviewText}>
          {review.comment}
        </Text>
      )}

      {/* ── existing reply (read mode) ── */}
      {review.providerReply && !editMode && (
        <div className={styles.existingReply}>
          <div className={styles.replyHead}>
            <Text
              variant="nano"
              as="span"
              weight="bold"
              color="accent"
              className={styles.replyLabel}
            >
              Twoja odpowiedź
            </Text>
            {review.providerRepliedAt && (
              <Text variant="nano" as="span" color="muted">
                {formatDate(review.providerRepliedAt)}
              </Text>
            )}
            <div className={styles.replyActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyText(review.providerReply ?? '');
                  setEditMode(true);
                }}
              >
                <IconPencil width="12" height="12" />
                Edytuj
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDeleteReply} loading={saving}>
                <IconTrash width="12" height="12" />
                Usuń
              </Button>
            </div>
          </div>
          <Text variant="body-sm" as="p" color="secondary">
            {review.providerReply}
          </Text>
        </div>
      )}

      {/* ── reply composer ── */}
      {showComposer && (
        <div
          className={[styles.replyCompose, review.rating <= 3 ? styles.replyComposeCritical : null]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.composeHead}>
            <Text variant="nano" as="span" weight="bold" color="secondary">
              {editMode ? 'Edytuj odpowiedź' : 'Twoja odpowiedź'}
            </Text>
            <Text variant="body-sm" as="span" color="muted">
              widoczna publicznie
            </Text>
          </div>

          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              review.rating >= 4
                ? 'Napisz szczerze, krótko, po imieniu. Odpowiedzi zwiększają zaufanie kolejnych klientów o ~30%.'
                : 'Przeproś, wyjaśnij krótko powód i powiedz co robisz, żeby się nie powtórzyło. Inni klienci to czytają.'
            }
            maxLength={500}
            rows={3}
          />

          <div className={styles.composeFoot}>
            <div className={styles.quickTemplates}>
              {templates.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={styles.templateChip}
                  onClick={() => setReplyText((prev) => (prev ? `${prev} ${t}` : t))}
                >
                  <Text variant="body-sm" as="span">
                    {t}
                  </Text>
                </button>
              ))}
            </div>
            <div className={styles.composeActions}>
              {editMode && (
                <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                  Anuluj
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendReply}
                loading={saving}
                disabled={!replyText.trim()}
              >
                {editMode ? 'Zapisz' : 'Wyślij odpowiedź'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {actionError && (
        <Text variant="body-sm" as="p" className={styles.actionError}>
          {actionError}
        </Text>
      )}
    </article>
  );
}
