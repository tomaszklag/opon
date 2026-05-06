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
  listDeletionRequests,
  confirmDeletion,
  cancelDeletion,
  getGusHealth,
} from '../../../api-data-access/admin';
import type { Provider, GusHealthStatus, GusHealthResponse } from '../../../api-data-access/admin';
import {
  listDataExportRequests,
  completeDataExportRequest,
  cancelDataExportRequest,
} from '../../../api-data-access/data-exports';
import type { DataExportRequestDto } from '../../../api-data-access/data-exports';
import type { ProviderStatus } from '../../../lib/auth';
import {
  IconBriefcase,
  IconCheck,
  IconBan,
  IconDownload,
  IconMobilePhone,
  IconMail,
  IconTrash,
} from '../../../components/icons';
import styles from './providers.module.css';

const STATUS_LABELS: Record<ProviderStatus, string> = {
  PENDING_NIP: 'Oczekuje na NIP',
  PENDING_DOCS: 'Oczekuje na dokumenty',
  PENDING_APPROVAL: 'Do weryfikacji',
  APPROVED: 'Zatwierdzona',
  SUSPENDED: 'Zawieszona',
  REJECTED: 'Odrzucona',
  PENDING_DELETION: 'Oczekuje na usunięcie',
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

function DeletionRow({
  provider,
  onConfirm,
  onCancel,
  busy,
}: {
  provider: Provider;
  onConfirm: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const typeLabel = provider.type === 'MOBILE' ? 'Mobilny' : 'Stacjonarny';
  const requestedDate = formatDate(provider.deletionRequestedAt ?? undefined);

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
                </span>
              </>
            )}
          </div>
          <Text variant="nano" as="span" color="muted">
            Wniosek złożony: {requestedDate}
          </Text>
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button
          variant="danger"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onConfirm(provider.id)}
        >
          <IconTrash width={13} height={13} />
          Potwierdź usunięcie
        </Button>
        <Button
          variant="neutral"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onCancel(provider.id)}
        >
          <IconBan width={13} height={13} />
          Anuluj wniosek
        </Button>
      </div>
    </div>
  );
}

function DataExportRow({
  request,
  onComplete,
  onCancel,
  busy,
}: {
  request: DataExportRequestDto;
  onComplete: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  busy: boolean;
}) {
  const requestedDate = formatDate(request.requestedAt);

  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={styles.rowIcon} aria-hidden="true">
          <IconDownload width={16} height={16} />
        </div>
        <div className={styles.rowInfo}>
          <div className={styles.rowNameLine}>
            <Text variant="body-sm" as="span" weight="bold" color="primary">
              {request.providerName}
            </Text>
          </div>
          <div className={styles.rowMeta}>
            <Text variant="nano" as="span" color="muted" mono>
              NIP {request.providerNip}
            </Text>
            {request.providerEmail && (
              <>
                <span className={styles.metaSep} aria-hidden="true" />
                <span className={styles.metaItem}>
                  <IconMail width={11} height={11} />
                  <Text variant="nano" as="span" color="muted">
                    {request.providerEmail}
                  </Text>
                </span>
              </>
            )}
          </div>
          <Text variant="nano" as="span" color="muted">
            Zamówiono: {requestedDate}
          </Text>
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button
          variant="primary"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onComplete(request.id)}
        >
          <IconCheck width={13} height={13} />
          Zrealizowane
        </Button>
        <Button
          variant="neutral"
          size="sm"
          loading={busy}
          disabled={busy}
          onClick={() => onCancel(request.id)}
        >
          <IconBan width={13} height={13} />
          Anuluj
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
  const {
    data: deletionData,
    isLoading: deletionLoading,
    mutate: mutateDeletion,
  } = useSWR('/v1/admin/providers?status=PENDING_DELETION', listDeletionRequests);
  const {
    data: dataExportData,
    isLoading: dataExportLoading,
    mutate: mutateDataExport,
  } = useSWR('/v1/admin/data-export-requests', listDataExportRequests);

  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [busyDeletionIds, setBusyDeletionIds] = useState<Set<string>>(new Set());
  const [busyDataExportIds, setBusyDataExportIds] = useState<Set<string>>(new Set());

  const isLoading = authLoading || dataLoading || deletionLoading || dataExportLoading;

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

  async function handleConfirmDeletion(id: string) {
    setBusyDeletionIds((prev) => new Set(prev).add(id));
    try {
      await confirmDeletion(id);
      await mutateDeletion();
    } finally {
      setBusyDeletionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleCancelDeletion(id: string) {
    setBusyDeletionIds((prev) => new Set(prev).add(id));
    try {
      await cancelDeletion(id);
      await mutateDeletion();
    } finally {
      setBusyDeletionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleCompleteDataExport(id: string) {
    setBusyDataExportIds((prev) => new Set(prev).add(id));
    try {
      await completeDataExportRequest(id);
      await mutateDataExport();
    } finally {
      setBusyDataExportIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleCancelDataExport(id: string) {
    setBusyDataExportIds((prev) => new Set(prev).add(id));
    try {
      await cancelDataExportRequest(id);
      await mutateDataExport();
    } finally {
      setBusyDataExportIds((prev) => {
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
  const deletionProviders = deletionData?.data ?? [];
  const deletionTotal = deletionData?.total ?? 0;
  const dataExportRequests = dataExportData?.data ?? [];
  const dataExportTotal = dataExportData?.total ?? 0;

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
          {/* ── Verification section ── */}
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

          {/* ── Deletion requests section ── */}
          <div className={styles.sectionSep} />
          <div className={styles.pageHeader}>
            <div>
              <Heading variant="section" as="h2">
                Wnioski o usunięcie konta
              </Heading>
              <Text variant="body-sm" as="p" color="secondary">
                Warsztaty oczekujące na potwierdzenie usunięcia przez administratora
              </Text>
            </div>
            {deletionTotal > 0 && (
              <span className={`${styles.countBadge} ${styles.countBadgeDanger}`}>
                <Text variant="kicker" as="span" weight="bold" color="danger" mono>
                  {deletionTotal}
                </Text>
                <Text variant="nano" as="span" color="muted">
                  oczekujących
                </Text>
              </span>
            )}
          </div>

          {deletionProviders.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                illustration="done"
                title="Brak wniosków o usunięcie"
                description="Żaden warsztat nie złożył wniosku o usunięcie konta."
              />
            </div>
          ) : (
            <div className={styles.list}>
              {deletionProviders.map((provider) => (
                <DeletionRow
                  key={provider.id}
                  provider={provider}
                  onConfirm={handleConfirmDeletion}
                  onCancel={handleCancelDeletion}
                  busy={busyDeletionIds.has(provider.id)}
                />
              ))}
            </div>
          )}

          {/* ── Data export requests section ── */}
          <div className={styles.sectionSep} />
          <div className={styles.pageHeader}>
            <div>
              <Heading variant="section" as="h2">
                Zamówienia danych (RODO)
              </Heading>
              <Text variant="body-sm" as="p" color="secondary">
                Warsztaty oczekujące na przesłanie kopii swoich danych (art. 20 RODO)
              </Text>
            </div>
            {dataExportTotal > 0 && (
              <span className={styles.countBadge}>
                <Text variant="kicker" as="span" weight="bold" color="accent" mono>
                  {dataExportTotal}
                </Text>
                <Text variant="nano" as="span" color="muted">
                  oczekujących
                </Text>
              </span>
            )}
          </div>

          {dataExportRequests.length === 0 ? (
            <div className={styles.emptyWrap}>
              <EmptyState
                illustration="done"
                title="Brak zamówień danych"
                description="Żaden warsztat nie zamówił kopii swoich danych."
              />
            </div>
          ) : (
            <div className={styles.list}>
              {dataExportRequests.map((req) => (
                <DataExportRow
                  key={req.id}
                  request={req}
                  onComplete={handleCompleteDataExport}
                  onCancel={handleCancelDataExport}
                  busy={busyDataExportIds.has(req.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
