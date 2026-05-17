'use client';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Modal,
  Button,
  Combobox,
  DatePicker,
  Input,
  PhoneInput,
  Textarea,
  Text,
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
import { IconCheck } from '../../../components/icons';
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
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(getDefaultDate);
  const [timeInput, setTimeInput] = useState('');
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
    let p = selectedRimTier.pricePln;
    for (const sub of subServices) {
      if (!sub.included && checkedSubNames.has(sub.name)) {
        p += typeof sub.pricePln === 'number' ? sub.pricePln : 0;
      }
    }
    return p;
  }, [selectedRimTier, subServices, checkedSubNames]);

  // Total session duration for the summary panel
  const totalDurationMinutes = useMemo<number | null>(() => {
    if (!selectedRimTier) return null;
    let dur = selectedRimTier.durationMinutes;
    for (const sub of subServices) {
      if (!sub.included && checkedSubNames.has(sub.name)) {
        dur += subDurMinutes(sub);
      }
    }
    return dur;
  }, [selectedRimTier, subServices, checkedSubNames]);

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

  const endAt = useMemo(() => {
    if (!startAt) return null;
    const dur = totalDurationMinutes ?? 60;
    return new Date(new Date(startAt).getTime() + dur * 60_000).toISOString();
  }, [startAt, totalDurationMinutes]);

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
    setWorkerId('');
    setDate(getDefaultDate());
    setTimeInput('');
    setTotalPricePln('');
    setNotes('');
    setValidationError(null);
  }, []);

  function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
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
      ? `${selectedVariantRef.group.name} — ${selectedVariantRef.variant.name}`
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
                      <span className={styles.phoneDropdownName}>{s.name}</span>
                      <span className={styles.phoneDropdownPhone}>{s.phone}</span>
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
                        onClick={() => setSelectedRimKey(isSelected ? '' : key)}
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
                        <span
                          className={`${styles.subPrice} ${isChecked ? styles.subPriceAdded : ''}`}
                        >
                          {typeof sub.pricePln === 'number' ? `+${sub.pricePln} zł` : '—'}
                        </span>
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
                durationMinutes={totalDurationMinutes}
                selectedTime={timeInput}
                date={date}
                onSelect={setTimeInput}
              />
            )}

            {/* Manual time fallback */}
            <div className={styles.timelineManualInput}>
              <Input
                label="Godzina (ręcznie)"
                type="time"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
              />
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
          <Textarea
            label="Notatki"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Podsumowanie
            </Text>
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
                      {selectedVariantRef!.group.name} — {selectedVariantRef!.variant.name}
                    </Text>
                    <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                      {formatRimLabel(selectedRimTier.rimSizes)} · {selectedRimTier.durationMinutes}{' '}
                      min
                    </Text>
                  </div>
                  <span className={styles.sumVal}>{selectedRimTier.pricePln} zł</span>
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
                      <span className={styles.sumValAdd}>
                        +{typeof sub.pricePln === 'number' ? sub.pricePln : 0} zł
                      </span>
                    </div>
                  );
                })}

                {/* Total */}
                <div className={`${styles.sumRow} ${styles.sumRowTotal}`}>
                  <div className={styles.sumName}>
                    <Text variant="body-sm" weight="bold" as="span">
                      Do zapłaty
                    </Text>
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
