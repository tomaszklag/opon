import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Chip } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Design System/Display/Chip',
  component: Chip,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: { label: 'Wymiana opon' },
};

export const Selected: Story = {
  args: { label: 'Wymiana opon', selected: true },
};

export const WithRemove: Story = {
  args: { label: 'Wymiana opon', onRemove: () => alert('removed') },
};

export const Disabled: Story = {
  args: { label: 'Niedostępne', disabled: true },
};

export const FilterGroup: Story = {
  render: () => {
    const filters = ['Wszystkie', 'Oczekuje', 'Potwierdzone', 'Zakończone', 'Anulowane'];
    const [active, setActive] = useState('Wszystkie');

    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <Chip key={f} label={f} selected={active === f} onSelect={() => setActive(f)} />
        ))}
      </div>
    );
  },
};
