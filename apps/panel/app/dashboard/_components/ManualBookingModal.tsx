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
  Toggle,
  Text,
  Spinner,
} from '@opony/design-system-web';
import { useCreateManualBooking } from '../../../lib/hooks/use-create-manual-booking';
import { useWorkersList } from '../../../lib/hooks/use-workers-list';
import { useAvailability } from '../../../lib/hooks/use-availability';
import { useServiceGroups } from '../../../lib/hooks/use-service-groups';
import { useClientSearch } from '../../../lib/hooks/use-client-search';
import type {
  ServiceGroupResponse,
  ServiceVariantResponse,
} from '../../../api-data-access/service-groups';
import { IconCheck } from '../../../components/icons';
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
  // Stable UUID per modal session — rotated on each open
  const idempotencyKeyRef = useRef<string | null>(null);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  // variant.id — drives rim chips + sub-services cascade
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
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { suggestions } = useClientSearch(clientPhone);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const phoneWrapperRef = useRef<HTMLDivElement>(null);

  const {
    availability,
    isLoading: availLoading,
    mutate: mutateAvailability,
  } = useAvailability(date, workerId || undefined);

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

  const selectedRimTier = useMemo<RimTier | null>(() => {
    if (!selectedVariantRef || !selectedRimKey) return null;
    return (
      selectedVariantRef.variant.rimTiers.find((t) => rimKey(t.rimSizes) === selectedRimKey) ?? null
    );
  }, [selectedVariantRef, selectedRimKey]);

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

  const serviceOptions = useMemo(
    () => [
      { value: '', label: 'Wybierz usługę z cennika…' },
      ...serviceGroups.flatMap((g) =>
        g.variants
          .filter((v) => v.enabled)
          .map((v) => ({ value: v.id, label: `${g.name} — ${v.name}` })),
      ),
    ],
    [serviceGroups],
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

  // Nearest fully-free slot at or after entered time
  const nearestFreeSlot = useMemo(() => {
    if (!availability?.slots?.length || !timeInput) return null;
    const [h, m] = timeInput.split(':');
    const targetMin = Number(h) * 60 + Number(m ?? 0);
    return (
      availability.slots.find((s) => {
        const d = new Date(s.startAt);
        return (
          d.getHours() * 60 + d.getMinutes() >= targetMin && s.isAvailable && s.conflictCount === 0
        );
      }) ?? null
    );
  }, [availability, timeInput]);

  // Best-fit slot: free slot adjacent to a booked slot → minimises idle gaps
  const bestFitSlot = useMemo(() => {
    if (!availability?.slots?.length) return null;
    const free = availability.slots.filter((s) => s.isAvailable && s.conflictCount === 0);
    if (!free.length) return null;
    const busy = availability.slots.filter((s) => !s.isAvailable || s.conflictCount > 0);
    if (!busy.length) return free[0] ?? null;
    const scored = free.map((slot) => ({
      slot,
      score:
        (busy.some((b) => b.endAt === slot.startAt) ? 2 : 0) +
        (busy.some((b) => b.startAt === slot.endAt) ? 1 : 0),
    }));
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime(),
    );
    return scored[0]?.slot ?? null;
  }, [availability]);

  useEffect(() => {
    if (!isOpen) return;
    idempotencyKeyRef.current = crypto.randomUUID();
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
    setSelectedVariantKey('');
    setSelectedRimKey('');
    setCheckedSubNames(new Set());
    setWorkerId('');
    setDate(getDefaultDate());
    setTimeInput('');
    setTotalPricePln('');
    setNotes('');
    setAutoConfirm(true);
    setValidationError(null);
  }, []);

  function handleVariantChange(variantId: string) {
    setSelectedVariantKey(variantId);
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
    const phoneDigits = digits.startsWith('48') && digits.length === 11 ? digits.slice(2) : digits;
    setClientPhone(phoneDigits);
    setClientName(name);
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

    if (!clientName.trim() || !clientPhone.trim()) {
      setValidationError('Wypełnij imię i nazwisko oraz telefon.');
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

    const result = await createBooking(
      {
        clientName: clientName.trim(),
        clientPhone: `+48${clientPhone.trim()}`,
        startAt,
        endAt,
        tireSize: resolvedTireSize,
        serviceType: resolvedServiceType,
        workerId: workerId || undefined,
        totalPricePln: resolvedPrice,
        notes: notes.trim() || undefined,
        autoConfirm,
        availabilityVersion: availability?.version,
      },
      idempotencyKeyRef.current ?? undefined,
    );

    if (result.success) {
      onSuccess?.();
      onClose();
      resetForm();
    } else if (result.code === 'BOOKING_SLOT_TAKEN' || result.code === 'BOOKING_VERSION_MISMATCH') {
      // Refresh availability so user sees current state; rotate idempotency key for retry
      void mutateAvailability();
      idempotencyKeyRef.current = crypto.randomUUID();
    }
  }

  const hasRimTiers = (selectedVariantRef?.variant.rimTiers.length ?? 0) > 0;
  const priceInputValue =
    totalPricePln !== '' ? totalPricePln : autoPrice !== null ? String(autoPrice) : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wizyta ręczna"
      size="xl"
      footer={
        <>
          <Button variant="neutral" size="sm" onClick={onClose} type="button">
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="manual-booking-form"
            loading={isLoading}
          >
            {autoConfirm ? 'Utwórz i potwierdź' : 'Utwórz jako oczekującą'}
          </Button>
        </>
      }
    >
      <form id="manual-booking-form" onSubmit={handleSubmit} className={styles.form}>
        {/* ── Kolumna lewa: Klient + Usługa + Szczegóły ── */}
        <div className={styles.colLeft}>
          {/* Klient */}
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Klient
            </Text>
            <div className={styles.row2}>
              <Input
                label="Imię i nazwisko"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                autoComplete="off"
              />
              <div ref={phoneWrapperRef} className={styles.phoneWrapper}>
                <PhoneInput
                  label="Telefon"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setShowSuggestions(true);
                  }}
                  required
                  compact
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
            </div>
          </div>

          {/* Usługa */}
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Usługa
              <span className={styles.sectionBadge}>z cennika</span>
            </Text>
            <Combobox
              label="Wybierz usługę"
              value={selectedVariantKey}
              onChange={handleVariantChange}
              options={serviceOptions}
              placeholder="Szukaj usługi…"
            />

            {/* Rim chips — pojawiają się po wyborze wariantu z rim tiers */}
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
                        tabIndex={sub.included ? -1 : 0}
                        className={`${styles.subItem} ${sub.included ? styles.subItemIncl : isChecked ? styles.subItemChecked : ''}`}
                        onClick={() => {
                          if (!sub.included) toggleSubService(sub.name);
                        }}
                        onKeyDown={(e) => {
                          if (!sub.included && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            toggleSubService(sub.name);
                          }
                        }}
                      >
                        <span
                          className={`${styles.subChk} ${sub.included ? styles.subChkLocked : isChecked ? styles.subChkChecked : ''}`}
                        >
                          {(sub.included || isChecked) && <IconCheck width={8} height={8} />}
                        </span>
                        <div className={styles.subInfo}>
                          <Text variant="body-sm" as="span">
                            {sub.name}
                          </Text>
                          <Text variant="nano" color="muted" as="span">
                            {sub.included ? 'wliczone w cenę' : 'opcjonalne'}
                          </Text>
                        </div>
                        <span
                          className={`${styles.subPrice} ${sub.included ? styles.subPriceIncl : isChecked ? styles.subPriceAdded : ''}`}
                        >
                          {sub.included
                            ? 'wliczone'
                            : typeof sub.pricePln === 'number'
                              ? `+${sub.pricePln} zł`
                              : 'jak usł.'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Placeholder gdy usługa nie wybrana */}
            {!selectedVariantKey && (
              <div className={styles.placeholder}>
                <Text variant="body-sm" color="muted" as="p">
                  Wybierz usługę aby zobaczyć dostępne rozmiary i pod-usługi
                </Text>
              </div>
            )}
          </div>

          {/* Szczegóły */}
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Szczegóły
            </Text>
            <Input
              label="Cena końcowa (zł)"
              type="number"
              value={priceInputValue}
              onChange={(e) => setTotalPricePln(e.target.value)}
              min={0}
              placeholder={autoPrice !== null ? String(autoPrice) : 'auto'}
            />
            <Textarea
              label="Notatki"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <div className={styles.toggleRow}>
              <Toggle
                label="Potwierdź automatycznie"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* ── Kolumna prawa: Termin + Godzina + Podsumowanie ── */}
        <div className={styles.colRight}>
          {/* Termin */}
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Termin
            </Text>
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

          {/* Time picker */}
          <div className={styles.slotArea}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Godzina
            </Text>

            <Input
              label="Godzina wizyty"
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              required
            />

            {availLoading && (
              <div className={styles.spinnerRow}>
                <Spinner size="sm" />
              </div>
            )}

            {!availLoading && availability?.isClosedDay && (
              <Text variant="body-sm" color="muted" as="p" className={styles.closedMsg}>
                Warsztat nieczynny tego dnia
              </Text>
            )}

            {/* Best-fit suggestion when no time entered yet */}
            {!timeInput && !availLoading && bestFitSlot && (
              <button
                type="button"
                className={styles.slotSuggestion}
                onClick={() => setTimeInput(formatSlotTime(bestFitSlot.startAt))}
              >
                <span className={styles.slotSuggestionLabel}>
                  Sugerujemy {formatSlotTime(bestFitSlot.startAt)}
                </span>
                <span className={styles.slotSuggestionHint}>minimalizuje przerwy →</span>
              </button>
            )}

            {/* Conflict warning */}
            {timeInput && hasConflict && (
              <div className={styles.conflictBanner}>
                <Text variant="body-sm" color="warning" as="p">
                  Wizyta zachodzi na {totalConflictCount} {pluralConflicts(totalConflictCount)} —
                  zapis możliwy.
                </Text>
                {nearestFreeSlot && (
                  <button
                    type="button"
                    className={styles.slotSuggestion}
                    onClick={() => setTimeInput(formatSlotTime(nearestFreeSlot.startAt))}
                  >
                    <span className={styles.slotSuggestionLabel}>
                      Najbliższy wolny: {formatSlotTime(nearestFreeSlot.startAt)}
                    </span>
                    <span className={styles.slotSuggestionHint}>użyj →</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Podsumowanie */}
          <div className={styles.section}>
            <Text variant="kicker-sm" color="muted" className={styles.sectionLabel}>
              Podsumowanie
            </Text>
            {!selectedRimTier ? (
              <div className={styles.summaryEmpty}>
                <Text variant="body-sm" color="muted" as="p">
                  {selectedVariantKey && !hasRimTiers
                    ? 'Wybierz godzinę wizyty'
                    : 'Wybierz usługę i rozmiar'}
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

                {/* Sub-services that are included or checked */}
                {subServices.map((sub) => {
                  const isChecked = sub.included || checkedSubNames.has(sub.name);
                  if (!sub.included && !isChecked) return null;
                  const dur = subDurMinutes(sub);
                  return (
                    <div key={sub.name} className={styles.sumRow}>
                      <div className={styles.sumName}>
                        <Text variant="body-sm" as="span">
                          {sub.name}
                        </Text>
                        <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                          {sub.included ? 'wliczone' : 'opcjonalne'} · +{dur} min
                        </Text>
                      </div>
                      {sub.included ? (
                        <span className={styles.sumValIncl}>wliczone</span>
                      ) : (
                        <span className={styles.sumValAdd}>
                          +{typeof sub.pricePln === 'number' ? sub.pricePln : 0} zł
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Total */}
                <div className={`${styles.sumRow} ${styles.sumRowTotal}`}>
                  <div className={styles.sumName}>
                    <Text variant="body-sm" weight="bold" as="span">
                      Do zapłaty
                    </Text>
                    {totalDurationMinutes !== null && (
                      <Text variant="nano" color="muted" as="span" className={styles.sumSub}>
                        {timeInput ? `${timeInput} → ` : ''}
                        {totalDurationMinutes} min
                      </Text>
                    )}
                  </div>
                  <span className={styles.sumValTotal}>
                    {totalPricePln !== '' ? totalPricePln : autoPrice} zł
                  </span>
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
