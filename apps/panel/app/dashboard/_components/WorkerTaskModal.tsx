'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal,
  Button,
  Input,
  Select,
  Combobox,
  DatePicker,
  Textarea,
  Text,
} from '@opony/design-system-web';
import { useWorkersList } from '../../../lib/hooks/use-workers-list';
import { workerTasksApi } from '../../../api-data-access/worker-tasks';
import styles from './WorkerTaskModal.module.css';

interface WorkerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  weekStart: string;
  initialDate?: string;
  initialTime?: string;
}

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildTimeOptions(from = 6, to = 22, stepMin = 15) {
  const opts: { value: string; label: string }[] = [];
  for (let h = from; h <= to; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      if (h === to && m > 0) break;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      opts.push({ value: `${hh}:${mm}`, label: `${hh}:${mm}` });
    }
  }
  return opts;
}

const TIME_OPTIONS = buildTimeOptions();

function timeToMinutes(t: string): number {
  const [hStr, mStr] = t.split(':');
  return Number(hStr) * 60 + Number(mStr);
}

function minutesToTime(mins: number): string {
  const clamped = Math.min(Math.max(mins, 6 * 60), 22 * 60);
  const snapped = Math.round(clamped / 15) * 15;
  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getNearestSlotTime(): string {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const next = Math.ceil(mins / 15) * 15;
  const clamped = Math.min(Math.max(next, 6 * 60), 21 * 60 + 45);
  return minutesToTime(clamped);
}

function getDefaultEndTime(startTime: string): string {
  const endMins = Math.min(timeToMinutes(startTime) + 60, 22 * 60);
  return minutesToTime(endMins);
}

export function WorkerTaskModal({
  isOpen,
  onClose,
  onSuccess,
  weekStart,
  initialDate,
  initialTime,
}: WorkerTaskModalProps) {
  const { workers } = useWorkersList();
  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(() => weekStart || getDefaultDate());
  const [timeFrom, setTimeFrom] = useState(() => getNearestSlotTime());
  const [timeTo, setTimeTo] = useState(() => getDefaultEndTime(getNearestSlotTime()));
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setDate(initialDate || weekStart || getDefaultDate());
    const startTime = initialTime ?? getNearestSlotTime();
    setTimeFrom(startTime);
    setTimeTo(getDefaultEndTime(startTime));
  }, [isOpen, weekStart, initialDate, initialTime]);

  const workerOptions = [
    { value: '', label: 'Brak (zadanie ogólne)' },
    ...workers.map((w) => ({ value: w.id, label: w.name })),
  ];

  const toOptions = useMemo(() => TIME_OPTIONS.filter((o) => o.value > timeFrom), [timeFrom]);

  function handleFromChange(newFrom: string) {
    const durationMins = timeToMinutes(timeTo) - timeToMinutes(timeFrom);
    const newToMins = timeToMinutes(newFrom) + Math.max(durationMins, 15);
    const newTo = minutesToTime(newToMins);
    const validTo =
      TIME_OPTIONS.find((o) => o.value > newFrom && o.value >= newTo) ??
      [...TIME_OPTIONS].reverse().find((o) => o.value > newFrom);
    setTimeFrom(newFrom);
    setTimeTo(validTo?.value ?? newFrom);
  }

  const resetForm = useCallback(() => {
    setTitle('');
    setWorkerId('');
    setDate(getDefaultDate());
    const nearest = getNearestSlotTime();
    setTimeFrom(nearest);
    setTimeTo(getDefaultEndTime(nearest));
    setNotes('');
    setError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Podaj tytuł zadania.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await workerTasksApi.create({
        title: title.trim(),
        workerId: workerId || undefined,
        startAt: `${date}T${timeFrom}:00.000Z`,
        endAt: `${date}T${timeTo}:00.000Z`,
        notes: notes.trim() || undefined,
      });
      onSuccess?.();
      onClose();
      resetForm();
    } catch {
      setError('Nie udało się zapisać zadania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nowe zadanie"
      size="md"
      footer={
        <>
          <Button variant="neutral" size="md" onClick={onClose} type="button">
            Anuluj
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            form="worker-task-form"
            loading={isLoading}
          >
            Zapisz zadanie
          </Button>
        </>
      }
    >
      <form id="worker-task-form" onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Tytuł zadania"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          autoComplete="off"
        />
        <Select
          label="Pracownik"
          value={workerId}
          onChange={(e) => setWorkerId(e.target.value)}
          options={workerOptions}
        />
        <div className={[styles.row, styles.row3].join(' ')}>
          <DatePicker label="Data" value={date} onChange={setDate} required />
          <Combobox
            label="Od"
            value={timeFrom}
            onChange={handleFromChange}
            options={TIME_OPTIONS}
            placeholder="gg:mm"
          />
          <Combobox
            label="Do"
            value={timeTo}
            onChange={setTimeTo}
            options={toOptions}
            placeholder="gg:mm"
          />
        </div>
        <Textarea
          label="Notatki"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
        {error && (
          <Text variant="body-sm" color="danger" as="p" className={styles.errorMsg}>
            {error}
          </Text>
        )}
      </form>
    </Modal>
  );
}
