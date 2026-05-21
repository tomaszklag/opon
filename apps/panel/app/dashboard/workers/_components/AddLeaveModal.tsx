'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Combobox, DatePicker, Modal, Text, Textarea } from '@opony/design-system-web';
import type { Worker } from '../../../../lib/hooks/use-workers';
import type { CreateLeaveBody } from '../../../../api-data-access/workers';
import { LEAVE_TYPE_LABELS } from './WorkerCard';
import type { LeaveType } from '../../../../lib/hooks/use-workers';
import styles from './AddLeaveModal.module.css';

const LEAVE_TYPE_OPTIONS = (Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((k) => ({
  value: k,
  label: LEAVE_TYPE_LABELS[k],
}));

interface EditingLeave {
  leaveId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  note?: string | null;
}

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  defaultWorkerId?: string;
  editingLeave?: EditingLeave;
  saving: boolean;
  onAddLeave: (workerId: string, leave: CreateLeaveBody) => Promise<void>;
  onUpdateLeave?: (workerId: string, leaveId: string, leave: CreateLeaveBody) => Promise<void>;
}

interface FormState {
  workerId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  workerId: '',
  type: 'VACATION',
  startDate: '',
  endDate: '',
  note: '',
};

const VACATION_LIMIT = 26;

function toDate(iso: string): Date {
  return new Date(iso.slice(0, 10) + 'T00:00:00');
}

function differenceInDays(endDate: string, startDate: string): number {
  const end = toDate(endDate);
  const start = toDate(startDate);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function getYearUsedDays(
  workers: Worker[],
  workerId: string,
  type: LeaveType,
  excludeLeaveId?: string,
): number {
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return 0;
  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  let total = 0;
  for (const leave of worker.leaves) {
    if (leave.type !== type) continue;
    if (excludeLeaveId && leave.id === excludeLeaveId) continue;
    const start = toDate(leave.startDate);
    const end = toDate(leave.endDate);
    if (end < yearStart || start > yearEnd) continue;
    const s = start < yearStart ? yearStart : start;
    const e = end > yearEnd ? yearEnd : end;
    const days = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    if (days > 0) total += days;
  }
  return total;
}

function hasConflict(
  workers: Worker[],
  workerId: string,
  startDate: string,
  endDate: string,
  excludeLeaveId?: string,
): boolean {
  if (!workerId || !startDate || !endDate) return false;
  const worker = workers.find((w) => w.id === workerId);
  if (!worker) return false;
  return worker.leaves.some((leave) => {
    if (excludeLeaveId && leave.id === excludeLeaveId) return false;
    const leaveStart = leave.startDate.slice(0, 10);
    const leaveEnd = leave.endDate.slice(0, 10);
    return !(endDate < leaveStart || startDate > leaveEnd);
  });
}

export function AddLeaveModal({
  isOpen,
  onClose,
  workers,
  defaultWorkerId,
  editingLeave,
  saving,
  onAddLeave,
  onUpdateLeave,
}: AddLeaveModalProps) {
  const [form, setForm] = useState<FormState>({
    ...EMPTY_FORM,
    workerId: defaultWorkerId ?? workers[0]?.id ?? '',
  });
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingLeave) {
        setForm({
          workerId: defaultWorkerId ?? workers[0]?.id ?? '',
          type: editingLeave.type,
          startDate: editingLeave.startDate.slice(0, 10),
          endDate: editingLeave.endDate.slice(0, 10),
          note: editingLeave.note ?? '',
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          workerId: defaultWorkerId ?? workers[0]?.id ?? '',
        });
      }
      setApiError(null);
    }
  }, [isOpen, defaultWorkerId, editingLeave, workers]);

  const dayCount =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? differenceInDays(form.endDate, form.startDate) + 1
      : null;

  const conflict = hasConflict(
    workers,
    form.workerId,
    form.startDate,
    form.endDate,
    editingLeave?.leaveId,
  );
  const dateRangeInvalid = !!(form.startDate && form.endDate && form.endDate < form.startDate);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (dateRangeInvalid) return;
      setApiError(null);
      const body: CreateLeaveBody = {
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        note: form.note.trim() || undefined,
      };
      try {
        if (editingLeave && onUpdateLeave) {
          await onUpdateLeave(form.workerId, editingLeave.leaveId, body);
        } else {
          await onAddLeave(form.workerId, body);
        }
        onClose();
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Błąd zapisywania nieobecności');
      }
    },
    [form, editingLeave, onAddLeave, onUpdateLeave, onClose, dateRangeInvalid],
  );

  const workerOptions = workers.map((w) => ({ value: w.id, label: w.name }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLeave ? 'Edytuj nieobecność' : 'Nowa nieobecność'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} type="button">
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            form="add-leave-modal-form"
            loading={saving}
            disabled={saving || dateRangeInvalid}
          >
            {editingLeave ? 'Zapisz zmiany' : 'Zapisz nieobecność'}
          </Button>
        </>
      }
    >
      <form id="add-leave-modal-form" className={styles.form} onSubmit={handleSubmit}>
        {/* Worker select */}
        <Combobox
          label="Pracownik"
          options={workerOptions}
          value={form.workerId}
          onChange={(value) => setForm((prev) => ({ ...prev, workerId: value }))}
          disabled={!!defaultWorkerId || !!editingLeave}
          required
        />

        {/* Leave type */}
        <Combobox
          label="Typ nieobecności"
          options={LEAVE_TYPE_OPTIONS}
          value={form.type}
          onChange={(value) => setForm((prev) => ({ ...prev, type: value as LeaveType }))}
          required
        />

        {/* Year usage info */}
        {form.workerId &&
          (() => {
            const used = getYearUsedDays(workers, form.workerId, form.type, editingLeave?.leaveId);
            if (used === 0) return null;
            const planned = dayCount ?? 0;
            const isVacation = form.type === 'VACATION';
            const afterPlanned = used + planned;
            const overLimit = isVacation && planned > 0 && afterPlanned > VACATION_LIMIT;
            const nearLimit =
              isVacation && planned > 0 && afterPlanned >= VACATION_LIMIT * 0.85 && !overLimit;
            return (
              <div className={styles.yearUsage}>
                <Text
                  variant="nano"
                  mono
                  color={overLimit ? 'danger' : nearLimit ? 'warning' : 'secondary'}
                  as="span"
                >
                  W tym roku: {used} {used === 1 ? 'dzień' : 'dni'}{' '}
                  {LEAVE_TYPE_LABELS[form.type].toLowerCase()}
                  {isVacation && ` (limit: ${VACATION_LIMIT} dni)`}
                </Text>
                {(overLimit || nearLimit) && planned > 0 && (
                  <Text variant="nano" color={overLimit ? 'danger' : 'warning'} as="span">
                    {overLimit
                      ? `Po zgłoszeniu: ${afterPlanned} dni — przekroczony limit!`
                      : `Po zgłoszeniu: ${afterPlanned} dni — zbliżasz się do limitu`}
                  </Text>
                )}
              </div>
            );
          })()}

        {/* Date row */}
        <div className={styles.dateRow}>
          <DatePicker
            label="Od"
            value={form.startDate}
            max={form.endDate || undefined}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                startDate: value,
                endDate: prev.endDate && prev.endDate < value ? '' : prev.endDate,
              }))
            }
            required
          />
          <DatePicker
            label="Do"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(value) => setForm((prev) => ({ ...prev, endDate: value }))}
            error={
              form.startDate && form.endDate && form.endDate < form.startDate
                ? 'Musi być po dacie początku'
                : undefined
            }
            required
          />
        </div>
        {dayCount !== null && (
          <div className={styles.dayCountRow}>
            <Text variant="body-sm" mono color="accent" as="span">
              Łącznie: {dayCount} {dayCount === 1 ? 'dzień' : 'dni'}
            </Text>
          </div>
        )}

        {/* Conflict warning */}
        {conflict && (
          <Text variant="body-sm" color="warning" as="p">
            Ten pracownik ma już nieobecność w tym terminie
          </Text>
        )}

        {/* Note */}
        <Textarea
          label="Notatka (opcjonalnie)"
          placeholder="Dodatkowe informacje..."
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          maxLength={500}
        />

        {/* API error */}
        {apiError && (
          <Text variant="body-sm" color="danger" as="p">
            {apiError}
          </Text>
        )}
      </form>
    </Modal>
  );
}
