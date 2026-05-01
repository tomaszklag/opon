import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from '../../forms/Button';

const meta: Meta<typeof BottomSheet> = {
  title: 'Design System/Feedback/BottomSheet',
  component: BottomSheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Otwórz Bottom Sheet</Button>
        <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Filtruj rezerwacje">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            Wybierz kryteria filtrowania rezerwacji.
          </p>
          <Button fullWidth onClick={() => setOpen(false)}>
            Zastosuj filtry
          </Button>
        </BottomSheet>
      </div>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <Button onClick={() => setOpen(true)}>Otwórz</Button>
        <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
          <p style={{ color: 'var(--text-secondary)' }}>Treść bez nagłówka.</p>
        </BottomSheet>
      </div>
    );
  },
};
