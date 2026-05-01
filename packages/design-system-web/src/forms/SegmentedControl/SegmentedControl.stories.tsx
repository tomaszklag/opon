import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Design System/Forms/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

const periodOptions = [
  { value: 'day', label: 'Dziś' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' },
];

const viewOptions = [
  { value: 'list', label: 'Lista' },
  { value: 'grid', label: 'Siatka' },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('week');
    return <SegmentedControl options={periodOptions} value={value} onChange={setValue} />;
  },
};

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState('list');
    return <SegmentedControl options={viewOptions} value={value} onChange={setValue} />;
  },
};

export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('day');
    return (
      <div style={{ width: 340 }}>
        <SegmentedControl options={periodOptions} value={value} onChange={setValue} fullWidth />
      </div>
    );
  },
};
