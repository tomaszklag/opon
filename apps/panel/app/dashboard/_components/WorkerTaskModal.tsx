'use client';
import React, { useState, useCallback } from 'react';
import { Modal, Button, Input, Select, Textarea, Text } from '@opony/design-system-web';
import { useWorkersList } from '../../../lib/hooks/use-workers-list';
import { workerTasksApi } from '../../../api-data-access/worker-tasks';
import styles from './WorkerTaskModal.module.css';

interface WorkerTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  weekStart: string;
}

function getDefaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WorkerTaskModal({ isOpen, onClose, onSuccess, weekStart }: WorkerTaskModalProps) {
  const { workers } = useWorkersList();
  const [title, setTitle] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [date, setDate] = useState(() => weekStart || getDefaultDate());
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [timeTo, setTimeTo] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerOptions = [
    { value: '', label: 'Brak (zadanie ogólne)' },
    ...workers.map((w) => ({ value: w.id, label: w.name })),
  ];

  const resetForm = useCallback(() => {
    setTitle('');
    setWorkerId('');
    setDate(getDefaultDate());
    setTimeFrom('08:00');
    setTimeTo('09:00');
    setNotes('');
    setError(null);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Podaj tytuł zadania.');
      return;
    }
    const startAt = `${date}T${timeFrom}:00.000Z`;
    const endAt = `${date}T${timeTo}:00.000Z`;
    if (new Date(endAt) <= new Date(startAt)) {
      setError('Godzina zakończenia musi być późniejsza niż rozpoczęcia.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await workerTasksApi.create({
        title: title.trim(),
        workerId: workerId || undefined,
        startAt,
        endAt,
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
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Od"
            type="time"
            value={timeFrom}
            onChange={(e) => setTimeFrom(e.target.value)}
            required
          />
          <Input
            label="Do"
            type="time"
            value={timeTo}
            onChange={(e) => setTimeTo(e.target.value)}
            required
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
