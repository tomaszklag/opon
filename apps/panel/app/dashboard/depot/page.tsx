'use client';

import { useState } from 'react';
import { Button, Heading, Input, Select, Spinner, Text } from '@opony/design-system-web';
import { useAuthGuard } from '../../../lib/hooks/use-auth-guard';
import { useDepot, useDepotDetail } from '../../../lib/hooks/use-depot';
import { useDepotSlots } from '../../../lib/hooks/use-depot-slots';
import type {
  TireSetDetail,
  TireSetStatus,
  CreateTireSetBody,
  UpdateTireSetBody,
} from '../../../api-data-access/depot';
import { DepotKpi } from './_components/DepotKpi';
import { DepotTable } from './_components/DepotTable';
import { DepotMap } from './_components/DepotMap';
import { TireSetModal } from './_components/TireSetModal';
import { TireSetDetailPanel } from './_components/TireSetDetail';
import { IconPlus } from '../../../components/icons';
import styles from './depot.module.css';

type Tab = 'list' | 'map';

export default function DepotPage() {
  const { isLoading: authLoading } = useAuthGuard('/dashboard');

  const [tab, setTab] = useState<Tab>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TireSetStatus | ''>('IN_DEPOT');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 30;

  const { items, total, stats, loading, error, createTireSet, updateTireSet, pickupTireSet } =
    useDepot({
      search: search || undefined,
      status: (statusFilter as TireSetStatus) || undefined,
      page,
      pageSize: PAGE_SIZE,
    });

  const { slots, sections, loading: slotsLoading } = useDepotSlots();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { detail, loading: detailLoading, setDetail } = useDepotDetail(selectedId);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TireSetDetail | null>(null);

  if (authLoading || (loading && items.length === 0)) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size="md" label="Ładowanie składu…" />
      </div>
    );
  }

  function handleOpenCreate() {
    setEditTarget(null);
    setShowModal(true);
  }

  function handleOpenEdit(d: TireSetDetail) {
    setEditTarget(d);
    setShowModal(true);
  }

  async function handleModalSubmit(body: CreateTireSetBody) {
    if (editTarget) {
      const updateBody: UpdateTireSetBody = {
        vehicleName: body.vehicleName,
        licensePlate: body.licensePlate,
        brand: body.brand,
        model: body.model,
        tireSize: body.tireSize,
        tireType: body.tireType,
        isOnRims: body.isOnRims,
        storagePricePln: body.storagePricePln,
        notes: body.notes,
      };
      const updated = await updateTireSet(editTarget.id, updateBody);
      setDetail(updated);
    } else {
      await createTireSet(body);
    }
  }

  async function handlePickup(id: string) {
    const updated = await pickupTireSet(id);
    setDetail(updated);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={styles.page}>
      <TireSetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        editValues={editTarget}
      />

      {error && (
        <Text variant="body-sm" as="p" className={styles.errorBanner}>
          {error}
        </Text>
      )}

      <div className={styles.content}>
        <header className={styles.pageHero}>
          <div>
            <Heading variant="display" as="h1">
              Skład opon
            </Heading>
            <div className={styles.pageSubRow}>
              <Text
                variant="nano"
                as="span"
                mono
                weight="bold"
                className={styles.statPill}
                color="accent"
              >
                {stats?.inDepot ?? 0}{' '}
                {(stats?.inDepot ?? 0) === 1
                  ? 'zestaw'
                  : (stats?.inDepot ?? 0) < 5
                    ? 'zestawy'
                    : 'zestawów'}
              </Text>
              <Text variant="body-sm" as="span" color="secondary">
                opon w składzie
              </Text>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button variant="primary" size="sm" onClick={handleOpenCreate}>
              <IconPlus width="12" height="12" />
              Dodaj zestaw
            </Button>
          </div>
        </header>

        <DepotKpi stats={stats} />

        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${tab === 'list' ? styles.tabActive : ''}`}
            onClick={() => setTab('list')}
          >
            <Text variant="body-sm" as="span" weight={tab === 'list' ? 'bold' : 'regular'}>
              Lista
            </Text>
          </button>
          <button
            className={`${styles.tab} ${tab === 'map' ? styles.tabActive : ''}`}
            onClick={() => setTab('map')}
          >
            <Text variant="body-sm" as="span" weight={tab === 'map' ? 'bold' : 'regular'}>
              Mapa składu
            </Text>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'list' && (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.searchWrap}>
                    <Input
                      label=""
                      placeholder="Szukaj klienta, nr rej…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                  <Select
                    label=""
                    options={[
                      { value: 'IN_DEPOT', label: 'W składzie' },
                      { value: 'PICKED_UP', label: 'Wydane' },
                      { value: '', label: 'Wszystkie' },
                    ]}
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as TireSetStatus | '');
                      setPage(1);
                    }}
                  />
                </div>

                <DepotTable items={items} onSelect={setSelectedId} />

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ← Poprzednia
                    </Button>
                    <Text variant="nano" as="span" color="secondary">
                      {page} / {totalPages}
                    </Text>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Następna →
                    </Button>
                  </div>
                )}
              </>
            )}

            {tab === 'map' &&
              (slotsLoading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <Spinner size="md" label="Ładowanie mapy…" />
                </div>
              ) : (
                <DepotMap
                  slots={slots}
                  sections={sections}
                  onSlotClick={(slot) => {
                    if (slot.tireSetId) setSelectedId(slot.tireSetId);
                  }}
                />
              ))}
          </div>

          {selectedId && (
            <div
              style={{
                width: 340,
                flexShrink: 0,
                padding: '16px 20px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                alignSelf: 'flex-start',
                position: 'sticky',
                top: 0,
              }}
            >
              <TireSetDetailPanel
                detail={detail}
                loading={detailLoading}
                onPickup={handlePickup}
                onEdit={handleOpenEdit}
                onClose={() => setSelectedId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
