'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Heading, Text, Button, EmptyState } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import {
  listPendingProviders,
  approveProvider,
  rejectProvider,
  getGusHealth,
} from '../../../api-data-access/admin';
import type { Provider, GusHealthStatus, GusHealthResponse } from '../../../api-data-access/admin';
import type { ProviderStatus } from '../../../lib/auth';
import {
  IconBriefcase,
  IconCheck,
  IconBan,
  IconMobilePhone,
  IconMail,
} from '../../../components/icons';
import styles from './providers.module.css';

const STATUS_LABELS: Record<ProviderStatus, string> = {
  PENDING_NIP: 'Oczekuje na NIP',
  PENDING_DOCS: 'Oczekuje na dokumenty',
  PENDING_APPROVAL: 'Do weryfikacji',
  APPROVED: 'Zatwierdzona',
  SUSPENDED: 'Zawieszona',
  REJECTED: 'Odrzucona',
};

const CEIDG_STATUS_LABELS: Record<GusHealthStatus, string> = {
  ok: 'OK',
  degraded: 'PRZERWA',
  down: 'NIEDOSTĘPNE',
};

function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  );
}

function CeidgStatusBadge() {
  const { data } = useSWR<GusHealthResponse>('/v1/admin/gus/health', getGusHealth, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  const status: GusHealthStatus | 'unknown' = data?.status ?? 'unknown';
  const label = status === 'unknown' ? '…' : CEIDG_STATUS_LABELS[status];

  return (
    <span className={styles.ceidgBadge} title={data?.message ?? 'Sprawdzanie statusu CEIDG…'}>
      <span className={styles.ceidgDot} data-status={status} aria-hidden="true" />
      <Text variant="nano" as="span" color="muted">
        CEIDG ● {label}
      </Text>
    </span>
  );
}

function ProviderRow({
  provider,
  onApprove,
  onReject,
  busy,
}: {
  provider: Provider;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const typeLabel = provider.type === 'MOBILE' ? 'Mobilny' : 'Stacjonarny';
  const submittedDate = formatDate(provider.submittedAt ? String(provider.submittedAt) : undefined);

  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={styles.rowIcon} aria-hidden="true">
          <IconBriefcase width={16} height={16} />
        </div>
        <div className={styles.rowInfo}>
          <div className={styles.rowNameLine}>
            <Text variant="body-sm" as="span" weight="bold" color="primary">
              {provider.name}
            </Text>
            <span className={styles.typeBadge}>
              <Text variant="nano" as="span" color="muted">
                {typeLabel}
              </Text>
            </span>
            <span className={styles.statusBadge} data-status={provider.status}>
              <Text variant="nano" as="span" color="muted">
                {STATUS_LABELS[provider.status as ProviderStatus] ?? provider.status}
              </Text>
            </span>
          </div>
          <div className={styles.rowMeta}>
            <Text variant="nano" as="span" color="muted" mono>
              NIP {provider.nip}
            </Text>
            {provider.phone && (
              <>
                <span className={styles.metaSep} aria-hidden="true" />
                <span className={styles.metaItem}>
                  <IconMobilePhone width={11} height={11} />
                  <Text variant="nano" as="span" color="muted">
                    {provider.phone}
                  </Text>
                </span>
              </>
            )}
            {provider.email && (
              <>
                <span className={styles.metaSep} aria-hidden="true" />
                <span className={styles.metaItem}>
                  <IconMail width={11} height={11} />
                  <Text variant="nano" as="span" color="muted">
                    {provider.email}
                  </Text>
                  <span
                    className={styles.emailBadge}
                    data-verified={!!provider.emailVerifiedAt}
                    title={
                      provider.emailVerifiedAt ? 'Email zweryfikowany' : 'Email niezweryfikowany'
                    }
                  >
                    <Text variant="nano" as="span">
                      {provider.emailVerifiedAt ? '✓' : '!'}
                    </Text>
                  </span>
                </span>
              </>
            )}
          </div>
          <Text variant="nano" as="span" color="muted">
            Zgłoszono: {submittedDate}
          </Text>
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button
          variant="primary"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onApprove(provider.id)}
        >
          <IconCheck width={13} height={13} />
          Zatwierdź
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onReject(provider.id)}
        >
          <IconBan width={13} height={13} />
          Odrzuć
        </Button>
      </div>
    </div>
  );
}

export default function AdminProvidersPage() {
  const { isLoading: authLoading } = useAuthGuard('/admin/providers');
  const {
    data,
    isLoading: dataLoading,
    mutate,
  } = useSWR('/v1/admin/providers?status=PENDING_APPROVAL', listPendingProviders);

  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const isLoading = authLoading || dataLoading;

  async function handleApprove(id: string) {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await approveProvider(id);
      await mutate();
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleReject(id: string) {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await rejectProvider(id);
      await mutate();
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <span className={styles.loadingSpinner} />
        </div>
      </div>
    );
  }

  const providers = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.topStrip}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandWordmark}>
            OPONY
            <span className={styles.brandDot} />
          </span>
          <Text variant="nano" as="span" color="muted" className={styles.adminTag}>
            ADMIN PANEL
          </Text>
        </Link>
        <CeidgStatusBadge />
      </header>

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.pageHeader}>
            <div>
              <Heading variant="section" as="h1">
                Weryfikacja warsztatów
              </Heading>
              <Text variant="body-sm" as="p" color="secondary">
                Warsztaty oczekujące na weryfikację i aktywację konta
              </Text>
            </div>
            <span className={styles.countBadge}>
              <Text variant="kicker" as="span" weight="bold" color="accent" mono>
                {total}
              </Text>
              <Text variant="nano" as="span" color="muted">
                oczekujących
              </Text>
            </span>
          </div>

          {providers.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                illustration="done"
                title="Wszystko zweryfikowane"
                description="Brak warsztatów oczekujących na weryfikację."
              />
            </div>
          ) : (
            <div className={styles.list}>
              {providers.map((provider) => (
                <ProviderRow
                  key={provider.id}
                  provider={provider}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  busy={busyIds.has(provider.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
