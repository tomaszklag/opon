'use client';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

function ModalDemo({ title, size }: { title?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Otwórz modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={title} size={size}>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontFamily: 'var(--font-body)' }}>
          Treść modala — np. potwierdzenie rezerwacji lub formularz.
        </p>
      </Modal>
    </>
  );
}

type Story = StoryObj<typeof Modal>;

export const Default: Story = { render: () => <ModalDemo title="Potwierdź rezerwację" /> };
export const Small: Story = { render: () => <ModalDemo title="Anuluj" size="sm" /> };
export const Large: Story = { render: () => <ModalDemo title="Szczegóły wizyty" size="lg" /> };
export const NoTitle: Story = { render: () => <ModalDemo /> };
