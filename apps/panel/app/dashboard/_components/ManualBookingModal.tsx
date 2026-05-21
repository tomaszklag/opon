'use client';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Combobox,
  DatePicker,
  FieldLabel,
  Input,
  NumberStepper,
  PhoneInput,
  SegmentedControl,
  Textarea,
  Text,
  TimeInput,
  Tooltip,
  Spinner,
} from '@opony/design-system-web';
import { useCreateManualBooking } from '../../../lib/hooks/use-create-manual-booking';
import { useWorkersList } from '../../../lib/hooks/use-workers-list';
import { useAvailability } from '../../../lib/hooks/use-availability';
import { useServiceGroups } from '../../../lib/hooks/use-service-groups';
import { useClientSearch } from '../../../lib/hooks/use-client-search';
import { useCustomServiceSearch } from '../../../lib/hooks/use-custom-service-search';
import { useBookings } from '../../../lib/hooks/use-bookings';
import type {
  ServiceGroupResponse,
  ServiceVariantResponse,
} from '../../../api-data-access/service-groups';
import { IconCheck, IconInfo } from '../../../components/icons';
import { DayTimeline } from './DayTimeline';
import styles from './ManualBookingModal.module.css';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialDate?: string;
  initialTime?: string;
}

type RimTier = ServiceVariantResponse['rimTiers'][number];
type SubService = ServiceVariantResponse['subServices'][number];

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

const CANCELLED_STATUSES = new Set([
  'CANCELLED_BY_CLIENT',
  'CANCELLED_BY_PROVIDER',
  'CANCELLED_BY_SYSTEM',
  'NO_SHOW',
  'REJECTED',
]);

function pluralConflicts(n: number): string {
  if (n === 1) return 'rezerwację';
  if (n >= 2 && n <= 4) return 'rezerwacje';
  return 'rezerwacji';
}

function formatRimLabel(rimSizes: string[]): string {
  const first = rimSizes[0];
  if (!first) return '';
  const last = rimSizes[rimSizes.length - 1];
  if (!last || rimSizes.length === 1) return first;
  return `${first}–${last}`;
}

function rimKey(rimSizes: string[]): string {
  return rimSizes.join(',');
}

// Sub-service duration is typed oddly in generated schema; cast at call sites.
function subDurMinutes(sub: SubService): number {
  return typeof (sub.durationMinutes as unknown as number) === 'number'
    ? (sub.durationMinutes as unknown as number)
    : 0;
}

function priceForCount(tier: RimTier, count: number): number {
  if (count === 4) return tier.pricePln;
  const perWheel = tier.pricePerWheelPln ?? tier.pricePln / 4;
  return Math.round(perWheel * count * 100) / 100;
}

function durForCount(tier: RimTier, count: number): number {
  if (count === 4) return tier.durationMinutes;
  const perWheel = tier.durationPerWheelMinutes ?? Math.round(tier.durationMinutes / 4);
  return perWheel * count;
}

function wheelCountLabel(count: number): string {
  if (count === 4) return 'komplet';
  if (count === 1) return '1 koło';
  return `${count} koła`;
}

function addMinutes(timeHHMM: string, minutes: number): string {
  const [hh, mm] = timeHHMM.split(':').map(Number);
  const total = ((hh ?? 0) * 60 + (mm ?? 0) + minutes + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function ManualBookingModal({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
  initialTime,
}: ManualBookingModalProps) {
  const { createBooking, isLoading, error } = useCreateManualBooking();
  const { workers } = useWorkersList();
  const { groups: serviceGroups } = useServiceGroups();
  const formRef = useRef<HTMLFormElement>(null);
  const pendingAutoConfirm = useRef(true);

  // 'catalog' | 'custom' — which service mode is active
  const [serviceMode, setServiceMode] = useState<'catalog' | 'custom'>('catalog');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  // true = client was selected from autocomplete; name is locked
  const [clientLinked, setClientLinked] = useState(false);
  // service group id — step 1 of service selection
  const [selectedGroupId, setSelectedGroupId] = useState('');
  // variant.id — step 2 (auto-set when group has 1 variant, or picked via chips)
  const [selectedVariantKey, setSelectedVariantKey] = useState('');
  // rimSizes.join(',') for the selected rim tier chip
  const [selectedRimKey, setSelectedRimKey] = useState('');
  // names of optional sub-services that are checked
  const [checkedSubNames, setCheckedSubNames] = useState<Set<string>>(new Set());
  const [wheelCount, setWheelCount] = useState(4);
  const [wheelExpanded, setWheelExpanded] = useState(false);
  // custom service state
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServiceQuery, setCustomServiceQuery] = useState('');
  const [showCustomSuggestions, setShowCustomSuggestions] = useState(false);

  const [customPricePln, setCustomPricePln] = useState('');
  const customServiceWrapperRef = useRef<HTMLDivElement>(null);

  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [timeInput, setTimeInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  // manual price override; empty = use auto-calculated price
  const [totalPricePln, setTotalPricePln] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { suggestions, isLoading: clientSearchLoading } = useClientSearch(clientPhone);
  const { suggestions: customSuggestions } = useCustomServiceSearch(customServiceQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const phoneDigits = clientPhone.replace(/\D/g, '');
  const phoneReady = phoneDigits.length >= 9;
  // Name field is editable only when phone is ready, search done and no existing client found
  const nameEditable =
    phoneReady && !clientSearchLoading && !clientLinked && suggestions.length === 0;
  const nameDisabled = !nameEditable;
  const phoneWrapperRef = useRef<HTMLDivElement>(null);

  const {
    availability,
    isLoading: availLoading,
    mutate: mutateAvailability,
  } = useAvailability(date, workerId || undefined);

  const weekStart = useMemo(() => getWeekStart(date), [date]);
  const { bookings: allBookings } = useBookings(weekStart);
  const dayBookings = useMemo(
    () =>
      allBookings.filter(
        (b) => b.startAt.slice(0, 10) === date && !CANCELLED_STATUSES.has(b.status),
      ),
    [allBookings, date],
  );

  // Resolve selected variant + its group from the loaded catalog
  const selectedVariantRef = useMemo<{
    group: ServiceGroupResponse;
    variant: ServiceVariantResponse;
  } | null>(() => {
    if (!selectedVariantKey) return null;
    for (const g of serviceGroups) {
      const v = g.variants.find((v) => v.id === selectedVariantKey);
      if (v) return { group: g, variant: v };
    }
    return null;
  }, [selectedVariantKey, serviceGroups]);

  // Only true when the variant actually has rim-size tiers (RIM_SIZES pricing type)
  const hasRimTiers = useMemo(
    () => (selectedVariantRef?.variant.rimTiers ?? []).some((t) => t.rimSizes.length > 0),
    [selectedVariantRef],
  );

  const selectedRimTier = useMemo<RimTier | null>(() => {
    if (!selectedVariantRef) return null;
    const tiers = selectedVariantRef.variant.rimTiers;
    if (!hasRimTiers) {
      // FLAT / VARIANTS pricing — auto-use the single virtual tier for price+duration
      return tiers[0] ?? null;
    }
    if (!selectedRimKey) return null;
    return tiers.find((t) => rimKey(t.rimSizes) === selectedRimKey) ?? null;
  }, [selectedVariantRef, selectedRimKey, hasRimTiers]);

  // Sub-services that are enabled for the selected variant
  const subServices = useMemo<SubService[]>(
    () => selectedVariantRef?.variant.subServices.filter((s) => s.enabled) ?? [],
    [selectedVariantRef],
  );

  // Auto-calculated price from rim tier + checked optional sub-services
  const autoPrice = useMemo<number | null>(() => {
    if (!selectedRimTier) return null;
    let p = priceForCount(selectedRimTier, wheelCount);
    for (const sub of subServices) {
      if (!sub.included && checkedSubNames.has(sub.name)) {
        p += typeof sub.pricePln === 'number' ? sub.pricePln : 0;
      }
    }
    return p;
  }, [selectedRimTier, wheelCount, subServices, checkedSubNames]);

  // Total session duration for the summary panel
  const totalDurationMinutes = useMemo<number | null>(() => {
    if (!selectedRimTier) return null;
    let dur = durForCount(selectedRimTier, wheelCount);
    for (const sub of subServices) {
      if (!sub.included && checkedSubNames.has(sub.name)) {
        dur += subDurMinutes(sub);
      }
    }
    return dur;
  }, [selectedRimTier, wheelCount, subServices, checkedSubNames]);

  const groupOptions = useMemo(
    () => [
      { value: '', label: 'Wybierz usługę z cennika…' },
      ...serviceGroups
        .filter((g) => g.variants.some((v) => v.enabled))
        .map((g) => ({ value: g.id, label: g.name })),
    ],
    [serviceGroups],
  );

  const selectedGroup = useMemo(
    () => serviceGroups.find((g) => g.id === selectedGroupId) ?? null,
    [selectedGroupId, serviceGroups],
  );

  const enabledVariants = useMemo(
    () => selectedGroup?.variants.filter((v) => v.enabled) ?? [],
    [selectedGroup],
  );

  const workerOptions = [
    { value: '', label: 'Dowolny' },
    ...workers.map((w) => ({ value: w.id, label: w.name })),
  ];

  // Derive ISO startAt/endAt from free time input
  const startAt = useMemo(() => {
    if (!date || !/^\d{2}:\d{2}$/.test(timeInput)) return null;
    return new Date(`${date}T${timeInput}:00`).toISOString();
  }, [date, timeInput]);

  // Derived end time: start + duration (both editable; changing end recalculates duration)
  const endTimeStr = useMemo(() => {
    if (!timeInput || !/^\d{2}:\d{2}$/.test(timeInput)) return '';
    return addMinutes(timeInput, durationMinutes);
  }, [timeInput, durationMinutes]);

  const endAt = useMemo(() => {
    if (!startAt || !endTimeStr) return null;
    return new Date(`${date}T${endTimeStr}:00`).toISOString();
  }, [startAt, endTimeStr, date]);

  const priceDelta = useMemo(() => {
    if (!totalPricePln || autoPrice === null) return null;
    const entered = Number(totalPricePln);
    if (isNaN(entered)) return null;
    const delta = Math.round((entered - autoPrice) * 100) / 100;
    return delta === 0 ? null : delta;
  }, [totalPricePln, autoPrice]);

  // Direct booking overlap — strict inequalities so edge-to-edge bookings don't conflict
  const conflictBookings = useMemo(() => {
    if (!startAt || !endAt) return [];
    return dayBookings.filter((b) => b.startAt < endAt && b.endAt > startAt);
  }, [startAt, endAt, dayBookings]);

  const hasConflict = conflictBookings.length > 0;

  const overlapMinutes = useMemo(() => {
    if (!startAt || !endAt) return 0;
    return conflictBookings.reduce((sum, b) => {
      const overlapStart = Math.max(new Date(startAt).getTime(), new Date(b.startAt).getTime());
      const overlapEnd = Math.min(new Date(endAt).getTime(), new Date(b.endAt).getTime());
      return sum + Math.round((overlapEnd - overlapStart) / 60_000);
    }, 0);
  }, [conflictBookings, startAt, endAt]);

  // Nearest fully-free slot at or after entered time

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    if (initialDate) setDate(initialDate);
    if (initialTime) setTimeInput(initialTime);
  }, [isOpen, initialDate, initialTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync duration when service variant or rim changes in catalog mode
  useEffect(() => {
    if (serviceMode === 'catalog' && totalDurationMinutes !== null) {
      setDurationMinutes(totalDurationMinutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariantKey, selectedRimKey]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (
        customServiceWrapperRef.current &&
        !customServiceWrapperRef.current.contains(e.target as Node)
      ) {
        setShowCustomSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = useCallback(() => {
    setServiceMode('catalog');
    setClientName('');
    setClientPhone('');
    setClientLinked(false);
    setSelectedGroupId('');
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWheelCount(4);
    setWheelExpanded(false);
    setCustomServiceName('');
    setCustomServiceQuery('');
    setCustomPricePln('');
    setShowCustomSuggestions(false);
    setWorkerId('');
    setDate(getDefaultDate());
    setTimeInput('');
    setDurationMinutes(60);
    setTotalPricePln('');
    setNotes('');
    setValidationError(null);
  }, []);

  function handleModeChange(mode: string) {
    setServiceMode(mode as 'catalog' | 'custom');
    setSelectedGroupId('');
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWheelCount(4);
    setWheelExpanded(false);
    setTotalPricePln('');
    setCustomServiceName('');
    setCustomServiceQuery('');
    setCustomPricePln('');
    setDurationMinutes(60);
  }

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWheelCount(4);
    setWheelExpanded(false);
    setTotalPricePln('');
    if (groupId) {
      const group = serviceGroups.find((g) => g.id === groupId);
      const enabled = group?.variants.filter((v) => v.enabled) ?? [];
      if (enabled.length === 1 && enabled[0]) {
        setSelectedVariantKey(enabled[0].id);
      }
    }
  }

  function handleVariantSelect(variantId: string) {
    setSelectedVariantKey(variantId === selectedVariantKey ? '' : variantId);
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWheelCount(4);
    setWheelExpanded(false);
    setTotalPricePln('');
  }

  function handleDateChange(newDate: string) {
    setDate(newDate);
  }

  function handleWorkerChange(newWorkerId: string) {
    setWorkerId(newWorkerId);
  }

  function selectSuggestion(phone: string, name: string) {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('48') && digits.length === 11 ? digits.slice(2) : digits;
    setClientPhone(normalized);
    setClientName(name);
    setClientLinked(true);
    setShowSuggestions(false);
  }

  function toggleSubService(subName: string) {
    setCheckedSubNames((prev) => {
      const next = new Set(prev);
      if (next.has(subName)) next.delete(subName);
      else next.add(subName);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!phoneReady) {
      setValidationError('Podaj numer telefonu (9 cyfr).');
      return;
    }
    if (nameEditable && !clientName.trim()) {
      setValidationError('Podaj imię i nazwisko klienta.');
      return;
    }
    if (!startAt || !endAt) {
      setValidationError('Podaj godzinę wizyty (format GG:MM).');
      return;
    }

    if (serviceMode === 'custom' && !customServiceName.trim()) {
      setValidationError('Podaj nazwę usługi.');
      return;
    }

    setValidationError(null);

    let result;
    if (serviceMode === 'custom') {
      result = await createBooking({
        clientName: clientName.trim(),
        clientPhone: `+48${clientPhone.trim()}`,
        startAt,
        endAt,
        serviceName: customServiceName.trim(),
        isCustomService: true,
        customDurationMinutes: durationMinutes,
        customPricePln: customPricePln ? Number(customPricePln) : undefined,
        workerId: workerId || undefined,
        notes: notes.trim() || undefined,
        autoConfirm: pendingAutoConfirm.current,
        availabilityVersion: availability?.version,
        skipAvailabilityCheck: true,
      });
    } else {
      const resolvedServiceType = selectedVariantRef
        ? `${selectedVariantRef.group.name}${enabledVariants.length > 1 ? ` — ${selectedVariantRef.variant.name}` : ''}${wheelCount < 4 ? ` (${wheelCountLabel(wheelCount)})` : ''}`
        : undefined;

      const resolvedTireSize = selectedRimTier
        ? formatRimLabel(selectedRimTier.rimSizes)
        : undefined;

      const resolvedPrice = totalPricePln ? Number(totalPricePln) : (autoPrice ?? undefined);

      const resolvedSubServices = subServices
        .filter((s) => checkedSubNames.has(s.name))
        .map((s) => ({ name: s.name, pricePln: s.pricePln ?? null }));

      result = await createBooking({
        clientName: clientName.trim(),
        clientPhone: `+48${clientPhone.trim()}`,
        startAt,
        endAt,
        tireSize: resolvedTireSize,
        serviceName: resolvedServiceType,
        subServices: resolvedSubServices.length > 0 ? resolvedSubServices : undefined,
        workerId: workerId || undefined,
        totalPricePln: resolvedPrice,
        notes: notes.trim() || undefined,
        autoConfirm: pendingAutoConfirm.current,
        availabilityVersion: availability?.version,
        skipAvailabilityCheck: true,
      });
    }

    if (result.success) {
      onSuccess?.();
      onClose();
      resetForm();
    } else if (result.code === 'BOOKING_SLOT_TAKEN' || result.code === 'BOOKING_VERSION_MISMATCH') {
      void mutateAvailability();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wizyta ręczna"
      size="xxl"
      footer={
        <>
          <Button variant="neutral" size="sm" onClick={onClose} type="button">
            Anuluj
          </Button>
          <Button
            variant="neutral"
            size="sm"
            type="button"
            loading={isLoading}
            onClick={() => {
              pendingAutoConfirm.current = false;
              formRef.current?.requestSubmit();
            }}
          >
            Utwórz jako oczekującą
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            loading={isLoading}
            onClick={() => {
              pendingAutoConfirm.current = true;
              formRef.current?.requestSubmit();
            }}
          >
            Utwórz i potwierdź
          </Button>
        </>
      }
    >
      <form ref={formRef} id="manual-booking-form" onSubmit={handleSubmit} className={styles.form}>
        {/* ── Kolumna lewa: Klient + Usługa + Szczegóły ── */}
        <div className={styles.colLeft}>
          {/* Klient */}
          <div className={styles.section}>
            <div ref={phoneWrapperRef} className={styles.phoneWrapper}>
              <PhoneInput
                label="Telefon"
                value={clientPhone}
                onChange={(e) => {
                  setClientPhone(e.target.value);
                  setClientLinked(false);
                  setClientName('');
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                loading={clientSearchLoading}
                compact
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className={styles.phoneDropdown}>
                  {suggestions.map((s) => (
                    <button
                      key={s.phone}
                      type="button"
                      className={styles.phoneDropdownItem}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(s.phone, s.name);
                      }}
                    >
                      <Text variant="body-sm" weight="semibold" as="span">
                        {s.name}
                      </Text>
                      <Text variant="nano" color="muted" as="span">
                        {s.phone}
                      </Text>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              label="Imię i nazwisko"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              disabled={nameDisabled}
              placeholder={!phoneReady ? 'Najpierw podaj numer telefonu' : undefined}
              autoComplete="off"
            />
          </div>

          {/* Usługa */}
          <div className={styles.section}>
            <SegmentedControl
              name="service-mode"
              value={serviceMode}
              onChange={handleModeChange}
              options={[
                { value: 'catalog', label: 'Z cennika' },
                { value: 'custom', label: 'Poza cennikiem' },
              ]}
              fullWidth
            />

            {/* ── Custom service mode ── */}
            {serviceMode === 'custom' && (
              <>
                <div ref={customServiceWrapperRef} className={styles.phoneWrapper}>
                  <Input
                    label="Nazwa usługi"
                    value={customServiceName}
                    onChange={(e) => {
                      setCustomServiceName(e.target.value);
                      setCustomServiceQuery(e.target.value);
                      setShowCustomSuggestions(true);
                    }}
                    onFocus={() => {
                      setCustomServiceQuery(customServiceName);
                      setShowCustomSuggestions(true);
                    }}
                    placeholder="np. Mycie silnika, Geometria…"
                    autoComplete="off"
                    required
                  />
                  {showCustomSuggestions && customSuggestions.length > 0 && (
                    <div className={styles.phoneDropdown}>
                      {customSuggestions.map((s) => (
                        <button
                          key={s.name}
                          type="button"
                          className={styles.phoneDropdownItem}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCustomServiceName(s.name);
                            setCustomServiceQuery(s.name);
                            if (s.avgPricePln != null) setCustomPricePln(String(s.avgPricePln));
                            setShowCustomSuggestions(false);
                          }}
                        >
                          <Text variant="body-sm" weight="semibold" as="span">
                            {s.name}
                          </Text>
                          <Text variant="nano" color="muted" as="span">
                            {[
                              s.avgDurationMinutes != null ? `${s.avgDurationMinutes} min` : null,
                              s.avgPricePln != null ? `~${s.avgPricePln} zł` : null,
                              `${s.count}×`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Text>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── Catalog mode ── */}
            {serviceMode === 'catalog' && (
              <>
                <Combobox
                  label="Usługa"
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  options={groupOptions}
                  placeholder="Szukaj usługi…"
                />

                {/* Variant chips — shown when group has multiple enabled variants */}
                {selectedGroupId && enabledVariants.length > 1 && (
                  <div>
                    <Text variant="kicker-sm" color="muted" as="p" className={styles.fieldLabel}>
                      Wariant
                    </Text>
                    <div className={styles.rimChips}>
                      {enabledVariants.map((v) => {
                        const tier = v.rimTiers[0];
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className={`${styles.rimChip} ${selectedVariantKey === v.id ? styles.rimChipSelected : ''}`}
                            onClick={() => handleVariantSelect(v.id)}
                          >
                            {v.name}
                            {tier && (
                              <>
                                <span className={styles.rimPrice}>{tier.pricePln} zł</span>
                                <span className={styles.rimDur}>{tier.durationMinutes} min</span>
                              </>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Rim chips — shown after variant selected, only for RIM_SIZES pricing type */}
                {selectedVariantKey && hasRimTiers && (
                  <div>
                    <Text variant="kicker-sm" color="muted" as="p" className={styles.fieldLabel}>
                      Rozmiar felgi
                    </Text>
                    <div className={styles.rimChips}>
                      {selectedVariantRef!.variant.rimTiers.map((tier) => {
                        const key = rimKey(tier.rimSizes);
                        const isSelected = selectedRimKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`${styles.rimChip} ${isSelected ? styles.rimChipSelected : ''}`}
                            onClick={() => {
                              setSelectedRimKey(isSelected ? '' : key);
                              setWheelCount(4);
                              setWheelExpanded(false);
                              setTotalPricePln('');
                            }}
                          >
                            {formatRimLabel(tier.rimSizes)}
                            <span className={styles.rimPrice}>{tier.pricePln} zł</span>
                            <span className={styles.rimDur}>{tier.durationMinutes} min</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ilość kół — domyślnie komplet, rzadki przypadek */}
                {selectedRimTier && (
                  <div>
                    {wheelExpanded ? (
                      <div className={styles.wheelCountRow}>
                        <Text variant="kicker-sm" color="muted" as="span">
                          Ilość kół:
                        </Text>
                        <NumberStepper
                          value={String(wheelCount)}
                          onChange={(v) => {
                            const n = Math.max(1, Math.min(4, parseInt(v, 10) || 1));
                            setWheelCount(n);
                            setTotalPricePln('');
                          }}
                          min={1}
                          max={4}
                          step={1}
                          inputWidth={44}
                          aria-label="Ilość kół"
                        />
                        <Text variant="body-sm" color="muted" as="span">
                          = {priceForCount(selectedRimTier, wheelCount)} zł ·{' '}
                          {durForCount(selectedRimTier, wheelCount)} min
                        </Text>
                        <button
                          type="button"
                          className={styles.notFullSetBtn}
                          onClick={() => {
                            setWheelCount(4);
                            setWheelExpanded(false);
                            setTotalPricePln('');
                          }}
                        >
                          <Text as="span" variant="body-sm" className={styles.notFullSetBtnText}>
                            wróć do kompletu
                          </Text>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.notFullSetBtn}
                        onClick={() => {
                          setWheelCount(1);
                          setWheelExpanded(true);
                          setTotalPricePln('');
                        }}
                      >
                        <Text as="span" variant="body-sm" className={styles.notFullSetBtnText}>
                          nie cały komplet?
                        </Text>
                      </button>
                    )}
                  </div>
                )}

                {/* Pod-usługi — pojawiają się po wyborze wariantu */}
                {selectedVariantKey && subServices.length > 0 && (
                  <div>
                    <Text variant="kicker-sm" color="muted" as="p" className={styles.fieldLabel}>
                      Pod-usługi
                    </Text>
                    <div className={styles.subList}>
                      {subServices.map((sub) => {
                        const isChecked = sub.included || checkedSubNames.has(sub.name);
                        return (
                          <div
                            key={sub.name}
                            role="checkbox"
                            aria-checked={isChecked}
                            tabIndex={0}
                            className={`${styles.subItem} ${isChecked ? styles.subItemChecked : ''}`}
                            onClick={() => toggleSubService(sub.name)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleSubService(sub.name);
                              }
                            }}
                          >
                            <span
                              className={`${styles.subChk} ${isChecked ? styles.subChkChecked : ''}`}
                            >
                              {isChecked && <IconCheck width={8} height={8} />}
                            </span>
                            <div className={styles.subInfo}>
                              <Text variant="body-sm" as="span">
                                {sub.name}
                              </Text>
                            </div>
                            <Text
                              variant="body-sm"
                              weight="bold"
                              color={isChecked ? 'accent' : 'muted'}
                              as="span"
                              className={styles.subPrice}
                            >
                              {typeof sub.pricePln === 'number' ? `+${sub.pricePln} zł` : '—'}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Placeholder when nothing selected yet */}
                {!selectedGroupId && (
                  <div className={styles.placeholder}>
                    <Text variant="body-sm" color="muted" as="p">
                      Wybierz usługę aby zobaczyć dostępne rozmiary i pod-usługi
                    </Text>
                  </div>
                )}
                {selectedGroupId && enabledVariants.length > 1 && !selectedVariantKey && (
                  <div className={styles.placeholder}>
                    <Text variant="body-sm" color="muted" as="p">
                      Wybierz wariant usługi
                    </Text>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Kolumna środkowa: Termin + Godzina ── */}
        <div className={styles.colMid}>
          {/* Termin */}
          <div className={styles.section}>
            <div className={styles.row2}>
              <DatePicker label="Data" value={date} onChange={handleDateChange} required />
              <Combobox
                label="Pracownik"
                value={workerId}
                onChange={handleWorkerChange}
                options={workerOptions}
                placeholder="Dowolny"
              />
            </div>
          </div>

          {/* Time picker — day timeline */}
          <div className={styles.slotArea}>
            {availLoading ? (
              <div className={styles.spinnerRow}>
                <Spinner size="sm" />
              </div>
            ) : (
              <DayTimeline
                slots={availability?.slots ?? []}
                bookings={dayBookings}
                durationMinutes={durationMinutes}
                selectedTime={timeInput}
                date={date}
                onSelect={setTimeInput}
              />
            )}

            {/* Od · Czas trwania · Do — trzy powiązane pola w jednej karcie */}
            <div className={styles.timeRangeGroup}>
              <div className={styles.timeRangeHeader}>
                <Text variant="label" color="muted" as="span">
                  Godziny wizyty
                </Text>
                <Tooltip content="Pola są ze sobą powiązane — zmiana dowolnego przelicza pozostałe. Start + czas trwania wyznaczają koniec; zmiana końca aktualizuje czas trwania.">
                  <span className={styles.timeRangeInfo}>
                    <IconInfo width={12} height={12} />
                  </span>
                </Tooltip>
              </div>
              <div className={styles.timeRangeFields}>
                <div className={styles.timeRangeField}>
                  <FieldLabel>Od</FieldLabel>
                  <TimeInput
                    value={timeInput}
                    onChange={setTimeInput}
                    dropdownStep={5}
                    aria-label="Godzina wizyty"
                  />
                </div>
                <div className={styles.timeRangeArrow} aria-hidden="true">
                  →
                </div>
                <div className={styles.timeRangeDuration}>
                  <FieldLabel>Czas (min)</FieldLabel>
                  <NumberStepper
                    value={String(durationMinutes)}
                    onChange={(v) =>
                      setDurationMinutes(Math.max(5, Math.min(600, parseInt(v, 10) || 60)))
                    }
                    min={5}
                    max={600}
                    step={5}
                    inputWidth={52}
                    aria-label="Czas trwania wizyty w minutach"
                  />
                </div>
                <div className={styles.timeRangeArrow} aria-hidden="true">
                  →
                </div>
                <div className={styles.timeRangeField}>
                  <FieldLabel>Do</FieldLabel>
                  <TimeInput
                    value={endTimeStr}
                    onChange={(v) => {
                      if (/^\d{2}:\d{2}$/.test(v)) {
                        setTimeInput(addMinutes(v, -durationMinutes));
                      }
                    }}
                    dropdownStep={5}
                    disabled={!timeInput || !/^\d{2}:\d{2}$/.test(timeInput)}
                    aria-label="Godzina zakończenia"
                  />
                </div>
              </div>
            </div>

            {!availLoading && availability?.isClosedDay && (
              <Text variant="body-sm" color="warning" as="p" className={styles.closedMsg}>
                Warsztat nieczynny tego dnia — zapis mimo to możliwy
              </Text>
            )}

            {/* Conflict warning */}
            {timeInput && hasConflict && (
              <div className={styles.conflictBanner}>
                <Text variant="body-sm" color="warning" as="p">
                  Nakłada się na {conflictBookings.length}{' '}
                  {pluralConflicts(conflictBookings.length)} (~{overlapMinutes} min wspólne).
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* ── Kolumna prawa: Szczegóły + Podsumowanie ── */}
        <div className={styles.colRight}>
          <div>
            <div className={styles.notesLabel}>
              <FieldLabel htmlFor="booking-notes">Notatki</FieldLabel>
              <Tooltip content="Widoczne tylko dla warsztatu — klient tego nie zobaczy">
                <IconInfo width={13} height={13} className={styles.notesInfoIcon} />
              </Tooltip>
            </div>
            <Textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>
              <FieldLabel>Podsumowanie</FieldLabel>
            </div>

            {/* Custom service summary */}
            {serviceMode === 'custom' &&
              (customServiceName.trim() ? (
                <div className={styles.summaryBox}>
                  <div className={styles.sumRow}>
                    <div className={styles.sumName}>
                      <Text variant="body-sm" as="span">
                        {customServiceName}
                      </Text>
                      <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                        {durationMinutes} min
                      </Text>
                    </div>
                  </div>
                  <div className={`${styles.sumRow} ${styles.sumRowTotal}`}>
                    <Text variant="body-sm" weight="bold" as="span">
                      Do zapłaty
                    </Text>
                    <div className={styles.sumTotalPrice}>
                      <input
                        type="number"
                        className={styles.priceInput}
                        value={customPricePln}
                        onChange={(e) => setCustomPricePln(e.target.value)}
                        placeholder="—"
                        min={0}
                        aria-label="Cena usługi custom (zł)"
                      />
                      <Text
                        as="span"
                        color="accent"
                        weight="extrabold"
                        className={styles.sumZlSuffix}
                      >
                        zł
                      </Text>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.summaryEmpty}>
                  <Text variant="body-sm" color="muted" as="p">
                    Podaj nazwę usługi
                  </Text>
                </div>
              ))}

            {/* Catalog service summary */}
            {serviceMode === 'catalog' &&
              (!selectedRimTier ? (
                <div className={styles.summaryEmpty}>
                  <Text variant="body-sm" color="muted" as="p">
                    {!selectedGroupId
                      ? 'Wybierz usługę'
                      : enabledVariants.length > 1 && !selectedVariantKey
                        ? 'Wybierz wariant'
                        : hasRimTiers
                          ? 'Wybierz rozmiar felgi'
                          : 'Wybierz usługę'}
                  </Text>
                </div>
              ) : (
                <div className={styles.summaryBox}>
                  {/* Base service + rim */}
                  <div className={styles.sumRow}>
                    <div className={styles.sumName}>
                      <Text variant="body-sm" as="span">
                        {selectedVariantRef!.group.name}
                        {enabledVariants.length > 1 && ` — ${selectedVariantRef!.variant.name}`}
                      </Text>
                      <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                        {formatRimLabel(selectedRimTier.rimSizes)}
                        {wheelCount < 4 && ` · ${wheelCountLabel(wheelCount)}`}
                        {' · '}
                        {durForCount(selectedRimTier, wheelCount)} min
                      </Text>
                    </div>
                    <Text variant="body-sm" weight="bold" as="span" className={styles.sumVal}>
                      {priceForCount(selectedRimTier, wheelCount)} zł
                    </Text>
                  </div>

                  {/* Sub-services that are checked */}
                  {subServices.map((sub) => {
                    const isChecked = checkedSubNames.has(sub.name);
                    if (!isChecked) return null;
                    const dur = subDurMinutes(sub);
                    return (
                      <div key={sub.name} className={styles.sumRow}>
                        <div className={styles.sumName}>
                          <Text variant="body-sm" as="span">
                            {sub.name}
                          </Text>
                          <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                            +{dur} min
                          </Text>
                        </div>
                        <Text
                          variant="body-sm"
                          weight="bold"
                          color="accent"
                          as="span"
                          className={styles.sumValAdd}
                        >
                          +{typeof sub.pricePln === 'number' ? sub.pricePln : 0} zł
                        </Text>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className={`${styles.sumRow} ${styles.sumRowTotal}`}>
                    <div className={styles.sumName}>
                      <Text variant="body-sm" weight="bold" as="span">
                        Do zapłaty
                      </Text>
                      {priceDelta !== null && (
                        <div className={styles.deltaRow}>
                          <Text variant="nano" color="warning" as="span">
                            nadpisano {priceDelta > 0 ? '+' : ''}
                            {priceDelta} zł
                          </Text>
                          <button
                            type="button"
                            className={styles.resetBtn}
                            onClick={() => setTotalPricePln('')}
                            aria-label="Resetuj cenę do wyliczonej"
                          >
                            <Text
                              as="span"
                              variant="nano"
                              weight="semibold"
                              className={styles.resetBtnText}
                            >
                              resetuj
                            </Text>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className={styles.sumTotalPrice}>
                      <input
                        type="number"
                        className={styles.priceInput}
                        value={totalPricePln}
                        onChange={(e) => setTotalPricePln(e.target.value)}
                        placeholder={autoPrice !== null ? String(autoPrice) : '—'}
                        min={0}
                        aria-label="Cena końcowa (zł)"
                      />
                      <span className={styles.sumValTotal}>zł</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Błędy — pełna szerokość */}
        {(validationError || error) && (
          <div className={styles.errorMsg}>
            <Text variant="body-sm" color="danger" as="p">
              {validationError ?? error}
            </Text>
          </div>
        )}
      </form>
    </Modal>
  );
}
