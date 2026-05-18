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

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

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
  const total = (hh ?? 0) * 60 + (mm ?? 0) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
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
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [timeInput, setTimeInput] = useState('');
  // manual end time override (HH:MM); empty = auto-calculated from start + duration
  const [manualEndTime, setManualEndTime] = useState('');
  // manual price override; empty = use auto-calculated price
  const [totalPricePln, setTotalPricePln] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const { suggestions, isLoading: clientSearchLoading } = useClientSearch(clientPhone);
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

  const calculatedEndTime = useMemo(() => {
    if (!timeInput || !/^\d{2}:\d{2}$/.test(timeInput)) return null;
    return addMinutes(timeInput, totalDurationMinutes ?? 60);
  }, [timeInput, totalDurationMinutes]);

  const endAt = useMemo(() => {
    if (!startAt) return null;
    const resolved = manualEndTime || calculatedEndTime;
    if (resolved && /^\d{2}:\d{2}$/.test(resolved)) {
      return new Date(`${date}T${resolved}:00`).toISOString();
    }
    const dur = totalDurationMinutes ?? 60;
    return new Date(new Date(startAt).getTime() + dur * 60_000).toISOString();
  }, [startAt, manualEndTime, calculatedEndTime, totalDurationMinutes, date]);

  // Effective duration — from manual end time if set, otherwise service-derived
  const effectiveDurationMinutes = useMemo(() => {
    if (startAt && endAt) {
      return Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000);
    }
    return totalDurationMinutes;
  }, [startAt, endAt, totalDurationMinutes]);

  const priceDelta = useMemo(() => {
    if (!totalPricePln || autoPrice === null) return null;
    const entered = Number(totalPricePln);
    if (isNaN(entered)) return null;
    const delta = Math.round((entered - autoPrice) * 100) / 100;
    return delta === 0 ? null : delta;
  }, [totalPricePln, autoPrice]);

  const durationDelta = useMemo(() => {
    if (!manualEndTime || totalDurationMinutes === null || effectiveDurationMinutes === null)
      return null;
    const delta = effectiveDurationMinutes - totalDurationMinutes;
    return delta === 0 ? null : delta;
  }, [manualEndTime, totalDurationMinutes, effectiveDurationMinutes]);

  // Slots that overlap [startAt, endAt] and have conflicts
  const overlapSlots = useMemo(() => {
    if (!startAt || !endAt || !availability?.slots) return [];
    return availability.slots.filter(
      (s) => s.startAt < endAt && s.endAt > startAt && (!s.isAvailable || s.conflictCount > 0),
    );
  }, [startAt, endAt, availability]);

  const hasConflict = overlapSlots.length > 0;
  const totalConflictCount = overlapSlots.reduce((n, s) => n + s.conflictCount, 0);
  const overlapMinutes = overlapSlots.length * (availability?.slotMinutes ?? 30);

  // Nearest fully-free slot at or after entered time

  useEffect(() => {
    if (!isOpen) return;
    if (initialDate) setDate(initialDate);
    if (initialTime) setTimeInput(initialTime);
  }, [isOpen, initialDate, initialTime]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (phoneWrapperRef.current && !phoneWrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetForm = useCallback(() => {
    setClientName('');
    setClientPhone('');
    setClientLinked(false);
    setSelectedGroupId('');
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWheelCount(4);
    setWheelExpanded(false);
    setWorkerId('');
    setDate(getDefaultDate());
    setTimeInput('');
    setManualEndTime('');
    setTotalPricePln('');
    setNotes('');
    setValidationError(null);
  }, []);

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

    setValidationError(null);

    const resolvedServiceType = selectedVariantRef
      ? `${selectedVariantRef.group.name}${enabledVariants.length > 1 ? ` — ${selectedVariantRef.variant.name}` : ''}${wheelCount < 4 ? ` (${wheelCountLabel(wheelCount)})` : ''}`
      : undefined;

    const resolvedTireSize = selectedRimTier ? formatRimLabel(selectedRimTier.rimSizes) : undefined;

    const resolvedPrice = totalPricePln ? Number(totalPricePln) : (autoPrice ?? undefined);

    const resolvedSubServices = subServices
      .filter((s) => checkedSubNames.has(s.name))
      .map((s) => ({ name: s.name, pricePln: s.pricePln ?? null }));

    const result = await createBooking({
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
                durationMinutes={effectiveDurationMinutes}
                selectedTime={timeInput}
                date={date}
                onSelect={setTimeInput}
              />
            )}

            {/* Manual time fallback */}
            <div className={styles.timelineManualInput}>
              <div className={styles.timeField}>
                <FieldLabel>Start</FieldLabel>
                <TimeInput
                  value={timeInput}
                  onChange={(v) => {
                    setTimeInput(v);
                    setManualEndTime('');
                  }}
                  dropdownStep={5}
                  aria-label="Godzina wizyty"
                />
              </div>
              {effectiveDurationMinutes !== null && (
                <div className={styles.durationBadge}>
                  <Text variant="nano" color="muted" as="span">
                    czas
                  </Text>
                  <Text variant="body-sm" weight="bold" as="span">
                    {effectiveDurationMinutes >= 60
                      ? `${Math.floor(effectiveDurationMinutes / 60)}h${effectiveDurationMinutes % 60 ? ` ${effectiveDurationMinutes % 60}min` : ''}`
                      : `${effectiveDurationMinutes} min`}
                  </Text>
                </div>
              )}
              <div className={styles.timeField}>
                <FieldLabel>{manualEndTime ? 'Koniec' : 'Koniec (auto)'}</FieldLabel>
                <TimeInput
                  value={manualEndTime || calculatedEndTime || ''}
                  onChange={(v) => setManualEndTime(v)}
                  dropdownStep={5}
                  disabled={!startAt}
                  aria-label="Godzina zakończenia"
                />
                {durationDelta !== null && (
                  <div className={styles.deltaRow}>
                    <Text variant="nano" color="warning" as="span">
                      {durationDelta > 0 ? '+' : ''}
                      {durationDelta} min
                    </Text>
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={() => setManualEndTime('')}
                      aria-label="Resetuj czas do wyliczonego"
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
                  Nakłada się na {totalConflictCount} {pluralConflicts(totalConflictCount)} (~
                  {overlapMinutes} min) — zapis mimo to możliwy.
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
            {!selectedRimTier ? (
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
            )}
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
