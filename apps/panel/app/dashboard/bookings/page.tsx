'use client';
import React, { useState } from 'react';
import {
  Text,
  KPICard,
  SearchInput,
  Tabs,
  Badge,
  Checkbox,
  Pagination,
} from '@opony/design-system-web';
import {
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconDownload,
  IconEye,
  IconFilter,
  IconMoreHoriz,
  IconSMS,
  IconTrash,
  IconXClose,
} from '../../../components/icons';
import {
  bookingsApi,
  type Booking,
  type BookingListParams,
  type AdminStatusFilter,
} from '../../../api-data-access/bookings';
import {
  useBookingAdmin,
  useBookingStats,
  useBookingTabCounts,
} from '../../../lib/hooks/use-booking-admin';
import { BookingTopbarActions } from '../_components/BookingTopbarActions';
import { ManualBookingModal } from '../_components/ManualBookingModal';
import { WorkerTaskDetailModal } from '../_components/WorkerTaskDetailModal';
import { useWorkerTasks } from '../../../lib/hooks/use-worker-tasks';
import { workerTasksApi, type WorkerTask } from '../../../api-data-access/worker-tasks';
import styles from './bookings.module.css';

function getTodayWeekStart(): string {
  const d = new Date();
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

// ── Status helpers ───────────────────────────────────────────────────────────

type BadgeStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

function toBadgeStatus(status: string): BadgeStatus {
  if (status === 'PENDING') return 'PENDING';
  if (status === 'CONFIRMED' || status === 'IN_PROGRESS') return 'CONFIRMED';
  if (status === 'COMPLETED') return 'COMPLETED';
  if (status === 'NO_SHOW') return 'NO_SHOW';
  return 'CANCELLED';
}

function formatAmount(pln: number | null, cancelled = false): React.ReactNode {
  if (pln == null)
    return (
      <Text variant="body-sm" color="muted">
        —
      </Text>
    );
  const formatted = pln.toFixed(2).replace('.', ',');
  return (
    <span className={cancelled ? styles.amountCancelled : styles.amount}>
      <Text variant="body-sm" weight="bold" mono as="span" color={cancelled ? 'muted' : undefined}>
        {formatted}
      </Text>
      <Text variant="nano" color="muted" mono as="span">
        {' '}
        zł
      </Text>
    </span>
  );
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, -6) + ' ••• ' + phone.slice(-3);
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type DateRelColor = 'accent' | 'warning' | 'muted' | undefined;

function formatDate(iso: string): { main: string; rel: string; relColor?: DateRelColor } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = diffMs / 3600000;
  const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
  const monthNames = [
    'sty',
    'lut',
    'mar',
    'kwi',
    'maj',
    'cze',
    'lip',
    'sie',
    'wrz',
    'paź',
    'lis',
    'gru',
  ];
  const time = d.toLocaleTimeString('pl', { hour: '2-digit', minute: '2-digit' });
  let main = '';
  let rel = '';
  let relColor: DateRelColor;

  if (diffDays === 0 && diffHours > 0) {
    main = `Dziś · ${time}`;
    const h = Math.floor(diffHours);
    const m = Math.floor((diffHours - h) * 60);
    rel = h > 0 ? `Za ${h} godz ${m} min` : `Za ${m} min`;
    relColor = diffHours <= 3 ? 'accent' : 'warning';
  } else if (diffDays === 1) {
    main = `Jutro · ${time}`;
    rel = `${dayNames[d.getDay()]} · ${d.getDate()} ${monthNames[d.getMonth()]}`;
  } else if (diffDays > 1) {
    main = `${dayNames[d.getDay()]} · ${d.getDate()} ${monthNames[d.getMonth()]} · ${time}`;
    rel = `Za ${diffDays} dni`;
  } else {
    main = `${dayNames[d.getDay()]} · ${d.getDate()} ${monthNames[d.getMonth()]} · ${time}`;
    const absDays = Math.abs(diffDays);
    rel = `Przed ${absDays} ${absDays === 1 ? 'dniem' : 'dniami'}`;
    relColor = 'muted';
  }
  return { main, rel, relColor };
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#FF8039 0%,#C73F0A 100%)',
  'linear-gradient(135deg,#64B5F6 0%,#1976D2 100%)',
  'linear-gradient(135deg,#AED581 0%,#558B2F 100%)',
  'linear-gradient(135deg,#BA68C8 0%,#6A1B9A 100%)',
  'linear-gradient(135deg,#FFD54F 0%,#F57F17 100%)',
  'linear-gradient(135deg,#4FC3F7 0%,#0277BD 100%)',
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]!;
}

// ── KPI Strip ────────────────────────────────────────────────────────────────

function KpiStrip() {
  const { stats } = useBookingStats();

  const trend = (curr: number | null, prev: number | null): string => {
    if (curr == null || prev == null) return '';
    const diff = curr - prev;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff}`;
  };

  const trendRate = (curr: number | null, prev: number | null): string => {
    if (curr == null || prev == null) return '';
    const diff = curr - prev;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff} pp`;
  };

  return (
    <div className={styles.kpiStrip}>
      <KPICard
        label="Łącznie (30 dni)"
        value={stats?.total ?? '—'}
        sub={stats ? `${trend(stats.total, stats.totalPrev)} vs poprzedni okres` : undefined}
      />
      <KPICard
        label="Przychód"
        value={stats ? `${stats.revenuePln.toLocaleString('pl')} zł` : '—'}
        sub={
          stats?.revenuePrevPln != null
            ? `${trend(Math.round(stats.revenuePln), Math.round(stats.revenuePrevPln))} zł`
            : undefined
        }
      />
      <KPICard
        label="Śr. wartość"
        value={stats ? `${stats.avgValuePln.toFixed(0)} zł` : '—'}
        sub="bez zmian"
      />
      <KPICard
        label="Realizacja"
        value={stats ? `${stats.completionRate}%` : '—'}
        sub={
          stats?.completionRatePrev != null
            ? trendRate(stats.completionRate, stats.completionRatePrev)
            : undefined
        }
      />
    </div>
  );
}

// ── Booking row ──────────────────────────────────────────────────────────────

interface RowProps {
  booking: Booking;
  selected: boolean;
  onToggle: () => void;
}

function BookingRow({ booking, selected, onToggle }: RowProps) {
  const badgeStatus = toBadgeStatus(booking.status);
  const isCancelled = badgeStatus === 'CANCELLED' || badgeStatus === 'NO_SHOW';
  const dt = formatDate(booking.startAt);
  const serviceLabel = booking.tireSize ? `— ${booking.tireSize}` : '';

  return (
    <tr
      className={[styles.tr, selected ? styles.trSelected : ''].filter(Boolean).join(' ')}
      onClick={onToggle}
    >
      <td className={styles.tcChk} onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onChange={onToggle} aria-label="Zaznacz wiersz" />
      </td>
      <td className={styles.td}>
        <Text variant="nano" mono weight="bold" color="muted" as="span" className={styles.cellId}>
          #{booking.referenceCode}
        </Text>
        <Text variant="body-sm" weight="bold" mono as="span" className={styles.dateMain}>
          {dt.main}
        </Text>
        <Text
          variant="nano"
          color={dt.relColor ?? 'muted'}
          weight={dt.relColor ? 'bold' : undefined}
          as="span"
          className={styles.dateRel}
        >
          {dt.rel}
        </Text>
      </td>
      <td className={styles.td}>
        <div className={styles.clientCell}>
          <span
            className={styles.avatar}
            style={{ background: avatarColor(booking.clientName) }}
            aria-hidden="true"
          >
            <Text variant="nano" weight="bold" as="span">
              {initials(booking.clientName)}
            </Text>
          </span>
          <div className={styles.clientInfo}>
            <Text variant="body-sm" weight="bold" as="span">
              {booking.clientName}
            </Text>
            <Text variant="nano" mono color="muted" as="span">
              {maskPhone(booking.clientPhone)}
            </Text>
          </div>
        </div>
      </td>
      <td className={styles.td}>
        <div className={styles.serviceCell}>
          <Text variant="body-sm" weight="semibold" as="span">
            {serviceLabel || 'Usługa'}
          </Text>
        </div>
      </td>
      <td className={[styles.td, styles.tdRight].join(' ')}>
        {formatAmount(booking.totalPricePln ?? null, isCancelled)}
      </td>
      <td className={styles.td}>
        <Badge
          status={badgeStatus}
          label={
            badgeStatus === 'CONFIRMED'
              ? 'Potwierdzone'
              : badgeStatus === 'COMPLETED'
                ? 'Zakończone'
                : badgeStatus === 'NO_SHOW'
                  ? 'No-show'
                  : undefined
          }
        />
      </td>
      <td className={styles.td}>
        <span
          className={[styles.sourcePill, booking.isManual ? styles.sourcePillManual : '']
            .filter(Boolean)
            .join(' ')}
        >
          <Text variant="nano" mono weight="bold" as="span">
            {booking.isManual ? 'RĘCZNA' : 'APP'}
          </Text>
        </span>
      </td>
      <td className={[styles.td, styles.tdRight].join(' ')}>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Zobacz"
            onClick={(e) => e.stopPropagation()}
          >
            <IconEye width={14} height={14} />
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Więcej opcji"
            onClick={(e) => e.stopPropagation()}
          >
            <IconMoreHoriz width={14} height={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Bulk Bar ─────────────────────────────────────────────────────────────────

interface BulkBarProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  onDeselect: () => void;
  onExport: () => void;
}

function BulkBar({ count, onConfirm, onCancel, onDeselect, onExport }: BulkBarProps) {
  return (
    <div className={styles.bulkBar} role="region" aria-label="Akcje masowe">
      <span className={styles.bulkCount}>
        <Text variant="kicker" weight="extrabold" mono as="span">
          {count}
        </Text>
        <Text variant="body-sm" weight="bold" as="span">
          {' '}
          zaznaczono
        </Text>
      </span>
      <span className={styles.bulkDivider} />
      <div className={styles.bulkActions}>
        <button type="button" className={styles.bulkBtn} onClick={onConfirm}>
          <IconCheck width={12} height={12} />
          <Text variant="nano" weight="bold" as="span">
            Potwierdź
          </Text>
        </button>
        <button type="button" className={styles.bulkBtn} onClick={onCancel}>
          <IconTrash width={12} height={12} />
          <Text variant="nano" weight="bold" as="span">
            Anuluj
          </Text>
        </button>
        <button type="button" className={styles.bulkBtn} onClick={onExport}>
          <IconDownload width={12} height={12} />
          <Text variant="nano" weight="bold" as="span">
            Eksport zaznaczonych
          </Text>
        </button>
        <button type="button" className={styles.bulkBtn}>
          <IconSMS width={12} height={12} />
          <Text variant="nano" weight="bold" as="span">
            Wyślij SMS
          </Text>
        </button>
      </div>
      <button
        type="button"
        className={styles.bulkClose}
        onClick={onDeselect}
        aria-label="Odznacz wszystko"
      >
        <IconXClose width={13} height={13} />
      </button>
    </div>
  );
}

// ── Task row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: WorkerTask;
  onOpen: () => void;
  onDelete: () => void;
}

function TaskRow({ task, onOpen, onDelete }: TaskRowProps) {
  const dt = formatDate(task.startAt);
  const workerLabel = task.workerName ?? 'Pracownik';
  return (
    <tr className={styles.trTask} onClick={onOpen} style={{ cursor: 'pointer' }}>
      <td className={styles.tcChk} />
      <td className={styles.td}>
        <Text variant="body-sm" weight="bold" mono as="span" className={styles.dateMain}>
          {dt.main}
        </Text>
        <Text variant="nano" color="muted" as="span" className={styles.dateRel}>
          {dt.rel}
        </Text>
      </td>
      <td className={styles.td}>
        <div className={styles.clientCell}>
          <span className={styles.taskAvatar} aria-hidden="true">
            <Text variant="nano" weight="bold" as="span">
              {workerLabel[0]?.toUpperCase() ?? 'Z'}
            </Text>
          </span>
          <div className={styles.clientInfo}>
            <Text variant="body-sm" weight="bold" as="span">
              {workerLabel}
            </Text>
          </div>
        </div>
      </td>
      <td className={styles.td}>
        <Text variant="body-sm" weight="semibold" as="span">
          {task.title}
        </Text>
      </td>
      <td className={[styles.td, styles.tdRight].join(' ')}>
        <Text variant="body-sm" color="muted" as="span">
          —
        </Text>
      </td>
      <td className={styles.td}>
        <span className={styles.taskPill}>
          <Text variant="nano" mono weight="bold" as="span">
            ZADANIE
          </Text>
        </span>
      </td>
      <td className={styles.td} />
      <td className={[styles.td, styles.tdRight].join(' ')}>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Szczegóły zadania"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <IconEye width={14} height={14} />
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Usuń zadanie"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <IconTrash width={14} height={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [taskDetailId, setTaskDetailId] = useState<string | null>(null);

  const params: BookingListParams = {
    status: statusFilter,
    search: search || undefined,
    page,
    pageSize,
    sortBy: 'startAt',
    sortDir: 'desc',
  };

  const { page: bookingPage, isLoading, mutate } = useBookingAdmin(params);
  const tabCounts = useBookingTabCounts();
  const { tasks, mutate: mutateTasks } = useWorkerTasks(getTodayWeekStart());
  const items = bookingPage?.items ?? [];

  // Selection
  const allSelected = items.length > 0 && items.every((b) => selectedIds.has(b.id));
  const someSelected = items.some((b) => selectedIds.has(b.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((b) => b.id)));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deselect = () => setSelectedIds(new Set());

  const handleBulkAction = async (action: 'confirm' | 'cancel') => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    await bookingsApi.bulkUpdate(ids, action);
    deselect();
    void mutate();
  };

  const STATUS_TABS = [
    { key: 'all', label: 'Wszystkie', count: bookingPage?.total },
    {
      key: 'pending',
      label: 'Oczekujące',
      count: tabCounts.pending,
      countWarn: !!tabCounts.pending,
    },
    { key: 'confirmed', label: 'Potwierdzone', count: tabCounts.confirmed },
    { key: 'completed', label: 'Zakończone', count: tabCounts.completed },
    { key: 'cancelled', label: 'Anulowane', count: tabCounts.cancelled },
  ];

  return (
    <div className={styles.root}>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.breadcrumb}>
          <Text variant="body-sm" color="muted" as="span">
            Operacje
          </Text>
          <Text variant="body-sm" color="muted" as="span" className={styles.sep}>
            ›
          </Text>
          <Text variant="body-sm" weight="bold" as="span">
            Rezerwacje
          </Text>
        </div>
        <div className={styles.topbarSpacer} />
        <BookingTopbarActions exportLabel="Eksport CSV" onAdd={() => setIsManualOpen(true)} />
      </div>

      <div className={styles.content}>
        <KpiStrip />

        {/* Filter bar */}
        <div className={styles.filterBar} role="search">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Szukaj klienta, telefonu, ID rezerwacji…"
            className={styles.searchInput}
          />
          <span className={styles.dividerV} />
          <button type="button" className={[styles.filterBtn, styles.filterBtnActive].join(' ')}>
            <IconCalendar width={12} height={12} />
            <Text variant="nano" weight="bold" as="span">
              Ostatnie 30 dni
            </Text>
            <IconChevronDown width={10} height={10} />
          </button>
          <button type="button" className={styles.filterBtn}>
            <Text variant="nano" weight="bold" as="span">
              Typ pojazdu
            </Text>
          </button>
          <button type="button" className={styles.filterBtn}>
            <Text variant="nano" weight="bold" as="span">
              Kwota
            </Text>
          </button>
          <button type="button" className={styles.filterBtn}>
            <IconFilter width={12} height={12} />
            <Text variant="nano" weight="bold" as="span">
              Więcej
            </Text>
            <span className={styles.countPill}>
              <Text variant="nano" weight="extrabold" mono as="span">
                2
              </Text>
            </span>
          </button>
          <span className={styles.dividerV} />
          <Tabs
            tabs={STATUS_TABS}
            activeKey={statusFilter}
            onChange={(key) => {
              setStatusFilter(key as AdminStatusFilter);
              setPage(1);
              deselect();
            }}
            className={styles.statusTabs}
          />
        </div>

        {/* Bulk bar */}
        {selectedIds.size > 0 && (
          <BulkBar
            count={selectedIds.size}
            onConfirm={() => void handleBulkAction('confirm')}
            onCancel={() => void handleBulkAction('cancel')}
            onDeselect={deselect}
            onExport={() => {}}
          />
        )}

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table} aria-label="Lista rezerwacji">
            <thead className={styles.thead}>
              <tr>
                <th className={[styles.th, styles.tcChk].join(' ')}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected && !allSelected}
                    onChange={toggleAll}
                    aria-label="Zaznacz wszystkie"
                  />
                </th>
                <th className={[styles.th, styles.sortable].join(' ')}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Data &amp; godzina
                  </Text>
                </th>
                <th className={styles.th}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Klient
                  </Text>
                </th>
                <th className={styles.th}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Usługa
                  </Text>
                </th>
                <th className={[styles.th, styles.thRight].join(' ')}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Kwota
                  </Text>
                </th>
                <th className={styles.th}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Status
                  </Text>
                </th>
                <th className={styles.th}>
                  <Text variant="nano" mono weight="extrabold" color="muted" as="span">
                    Źródło
                  </Text>
                </th>
                <th className={styles.th} />
              </tr>
            </thead>
            <tbody>
              {isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    <Text variant="body-sm" color="muted" as="span">
                      Ładowanie…
                    </Text>
                  </td>
                </tr>
              )}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    <Text variant="body-sm" color="muted" as="span">
                      Brak rezerwacji pasujących do filtrów.
                    </Text>
                  </td>
                </tr>
              )}
              {(() => {
                type Row = { kind: 'booking'; data: Booking } | { kind: 'task'; data: WorkerTask };
                const rows: Row[] = [
                  ...items.map((b): Row => ({ kind: 'booking', data: b })),
                  ...tasks.map((t): Row => ({ kind: 'task', data: t })),
                ];
                rows.sort(
                  (a, b) => new Date(b.data.startAt).getTime() - new Date(a.data.startAt).getTime(),
                );
                return rows.map((row) =>
                  row.kind === 'booking' ? (
                    <BookingRow
                      key={`b-${row.data.id}`}
                      booking={row.data}
                      selected={selectedIds.has(row.data.id)}
                      onToggle={() => toggleRow(row.data.id)}
                    />
                  ) : (
                    <TaskRow
                      key={`t-${row.data.id}`}
                      task={row.data}
                      onOpen={() => setTaskDetailId(row.data.id)}
                      onDelete={async () => {
                        await workerTasksApi.remove(row.data.id);
                        void mutateTasks();
                      }}
                    />
                  ),
                );
              })()}
            </tbody>
          </table>

          {/* Footer */}
          <div className={styles.tableFooter}>
            <Text variant="nano" mono color="secondary" as="span">
              <strong>
                {bookingPage
                  ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, bookingPage.total)}`
                  : '—'}
              </strong>
              {' z '}
              <strong>{bookingPage?.total ?? '—'}</strong>
              {' pozycji'}
            </Text>
            <span className={styles.dividerV} />
            <div className={styles.pageSize}>
              <Text variant="nano" mono color="muted" as="span">
                Na stronę
              </Text>
              <select
                className={styles.pageSizeSelect}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Liczba pozycji na stronę"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.pagSpacer} />
            {bookingPage && bookingPage.totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={bookingPage.totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  deselect();
                }}
                className={styles.pagination}
              />
            )}
          </div>
        </div>
      </div>

      <ManualBookingModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSuccess={() => void mutate()}
      />

      <WorkerTaskDetailModal
        taskId={taskDetailId}
        onClose={() => setTaskDetailId(null)}
        onDeleted={() => void mutateTasks()}
      />
    </div>
  );
}
