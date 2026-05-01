'use client';

import { useState } from 'react';
import {
  Button,
  Heading,
  RatingDistribution,
  Spinner,
  StarRating,
  Tabs,
  Text,
} from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useReviews, useReviewStats } from '../../../lib/hooks/use-reviews';
import { type ReviewRatingFilter, type ReviewTab } from '../../../api-data-access/reviews';
import { IconDownload, IconShare } from '../../../components/icons';
import { ReviewItem } from './_components/ReviewItem';
import styles from './reviews.module.css';

const TABS = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'pending', label: 'Do odpowiedzi' },
  { key: 'replied', label: 'Z odpowiedzią' },
  { key: 'reported', label: 'Zgłoszone' },
];

const RATING_FILTERS: { key: ReviewRatingFilter | 'all'; label: string }[] = [
  { key: 'all', label: 'Wszystkie gwiazdki' },
  { key: '5', label: '5 ★' },
  { key: '4', label: '4 ★' },
  { key: 'lte3', label: '≤ 3 ★' },
];

export default function ReviewsPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');

  const [activeTab, setActiveTab] = useState<ReviewTab>('pending');
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter | 'all'>('all');

  const sort = activeTab === 'pending' ? 'oldest_pending' : 'newest';

  const { stats, isLoading: statsLoading } = useReviewStats();
  const {
    reviews,
    isLoading: reviewsLoading,
    mutate,
  } = useReviews({
    tab: activeTab,
    rating: ratingFilter !== 'all' ? ratingFilter : undefined,
    sort,
  });

  const tabsWithCount = TABS.map((t) => {
    if (!stats) return t;
    const countMap: Record<string, number> = {
      all: stats.totalCount,
      pending: stats.pendingReplyCount,
      replied: stats.repliedCount,
      reported: stats.reportedCount,
    };
    return {
      ...t,
      count: countMap[t.key],
      countWarn: t.key === 'pending' && stats.pendingReplyCount > 0,
    };
  });

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie…" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── topbar actions ── */}
      <div className={styles.topbarActions}>
        <Button variant="ghost" size="sm">
          <IconDownload width="13" height="13" />
          Eksport CSV
        </Button>
        <Button variant="ghost" size="sm">
          <IconShare width="13" height="13" />
          Udostępnij profil
        </Button>
      </div>

      <div className={styles.content}>
        {/* ── HERO 3-col ── */}
        <div className={styles.heroRow}>
          {/* Rating big */}
          <div className={styles.ratingCard}>
            {statsLoading ? (
              <Spinner size="sm" />
            ) : stats ? (
              <>
                <div className={styles.ratingHead}>
                  <Heading variant="display-xl" as="span" className={styles.ratingHuge}>
                    {stats.avgRating.toFixed(1).replace('.', ',')}
                  </Heading>
                  <div className={styles.ratingCol}>
                    <StarRating value={Math.round(stats.avgRating)} readOnly size="md" />
                    <Text variant="body-sm" as="span" color="muted">
                      <strong>{stats.totalCount}</strong> opinii · wszystkie zweryfikowane
                    </Text>
                  </div>
                </div>
                <div className={styles.ratingMeta}>
                  <div className={styles.ratingMetaItem}>
                    <Text
                      variant="kicker"
                      as="span"
                      weight="bold"
                      className={styles.ratingMetaValPos}
                    >
                      +{stats.lastThirtyDaysCount}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      nowych · 30 dni
                    </Text>
                  </div>
                  <div className={styles.ratingMetaItem}>
                    <Text variant="kicker" as="span" weight="bold">
                      {stats.newCount}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      nieodczytanych
                    </Text>
                  </div>
                  <div className={styles.ratingMetaItem}>
                    <Text variant="kicker" as="span" weight="bold">
                      {stats.totalCount}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      łącznie
                    </Text>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Distribution chart */}
          <div className={styles.distCard}>
            <div className={styles.distHead}>
              <Heading variant="subsection" as="h2">
                Rozkład ocen
              </Heading>
              {stats && (
                <Text variant="nano" as="span" color="muted" mono>
                  {stats.totalCount} opinii
                </Text>
              )}
            </div>
            {statsLoading ? (
              <Spinner size="sm" />
            ) : stats ? (
              <RatingDistribution counts={stats.ratingCounts} />
            ) : null}
          </div>

          {/* Response stats */}
          <div className={styles.respCard}>
            {statsLoading ? (
              <Spinner size="sm" />
            ) : stats ? (
              <>
                <div className={styles.respHead}>
                  <Heading variant="subsection" as="h2" color="accent">
                    Odpowiedzi
                  </Heading>
                  {stats.replyRatePct >= 90 && (
                    <span className={styles.respTopChip}>
                      <Text variant="nano" as="span" weight="bold">
                        Top 10%
                      </Text>
                    </span>
                  )}
                </div>
                <div className={styles.respStatRow}>
                  <Heading variant="display" as="span" className={styles.respBig}>
                    {stats.replyRatePct}
                    <Text as="span" variant="body-md" color="accent" className={styles.respUnit}>
                      %
                    </Text>
                  </Heading>
                  <Text variant="nano" as="span" weight="bold" color="muted">
                    RATE
                  </Text>
                </div>
                <div className={styles.respMiniStats}>
                  <div className={styles.respMini}>
                    <Text variant="kicker" as="span" weight="bold" color="muted">
                      {stats.avgReplyTimeHours != null ? `~${stats.avgReplyTimeHours} h` : '—'}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      Avg czas odp.
                    </Text>
                  </div>
                  <div className={styles.respMini}>
                    <Text
                      variant="kicker"
                      as="span"
                      weight="bold"
                      className={stats.pendingReplyCount > 0 ? styles.respMiniWarn : ''}
                    >
                      {stats.pendingReplyCount}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      Nowe do odp.
                    </Text>
                  </div>
                  <div className={styles.respMini}>
                    <Text variant="kicker" as="span" weight="bold">
                      {stats.repliedCount}
                    </Text>
                    <Text variant="nano" as="span" weight="bold" color="muted">
                      Odpowiedzianych
                    </Text>
                  </div>
                </div>
                {stats.pendingReplyCount > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => setActiveTab('pending')}
                  >
                    Przejrzyj {stats.pendingReplyCount}{' '}
                    {stats.pendingReplyCount === 1 ? 'nową opinię' : 'nowe opinie'}
                  </Button>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs
          tabs={tabsWithCount}
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as ReviewTab)}
        />

        {/* ── Filter chips ── */}
        <div className={styles.filterRow}>
          {RATING_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`${styles.filterChip} ${ratingFilter === f.key ? styles.filterChipActive : ''}`}
              onClick={() => setRatingFilter(f.key)}
            >
              <Text variant="body-sm" as="span" weight="bold">
                {f.label}
              </Text>
            </button>
          ))}
          <span className={styles.sortInfo}>
            <Text variant="body-sm" as="span" color="muted">
              {activeTab === 'pending' ? 'Najstarsze niezaodpowiedziane' : 'Najnowsze'}
            </Text>
          </span>
        </div>

        {/* ── Review list ── */}
        <div className={styles.reviewList}>
          {reviewsLoading ? (
            <div className={styles.listLoading}>
              <Spinner size="md" label="Ładowanie opinii…" />
            </div>
          ) : reviews.length === 0 ? (
            <div className={styles.emptyState}>
              <Text variant="body" as="p" color="muted">
                {activeTab === 'pending'
                  ? 'Brak opinii wymagających odpowiedzi.'
                  : activeTab === 'reported'
                    ? 'Brak zgłoszonych opinii.'
                    : 'Brak opinii spełniających kryteria.'}
              </Text>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewItem key={review.id} review={review} onMutate={() => mutate()} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
