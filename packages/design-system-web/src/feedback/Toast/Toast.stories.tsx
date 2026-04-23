'use client';
import type { Meta, StoryObj } from '@storybook/react';
import { Toaster, toast } from './Toast';
import { Button } from '../../forms/Button';

const meta: Meta = {
  title: 'Design System/Toast',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('Rezerwacja potwierdzona!')}>Pokaż sukces</Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button variant="secondary" onClick={() => toast.error('Nie udało się anulować')}>
      Pokaż błąd
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="ghost" onClick={() => toast.info('Slot zajęty — wybierz inny termin')}>
      Pokaż info
    </Button>
  ),
};

export const AllToasts: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button size="sm" onClick={() => toast.success('Sukces!')}>
        Sukces
      </Button>
      <Button size="sm" variant="secondary" onClick={() => toast.error('Błąd!')}>
        Błąd
      </Button>
      <Button size="sm" variant="ghost" onClick={() => toast.info('Info')}>
        Info
      </Button>
    </div>
  ),
};
