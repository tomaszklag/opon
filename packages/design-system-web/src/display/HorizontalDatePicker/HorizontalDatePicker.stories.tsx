import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { HorizontalDatePicker } from './HorizontalDatePicker';

const meta: Meta<typeof HorizontalDatePicker> = {
  title: 'Design System/HorizontalDatePicker',
  component: HorizontalDatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HorizontalDatePicker>;

const CHIPS = [
  { date: '2025-04-14', dayOfWeek: 'Pn', dayNum: 14, available: true },
  { date: '2025-04-15', dayOfWeek: 'Wt', dayNum: 15, available: true },
  { date: '2025-04-16', dayOfWeek: 'Śr', dayNum: 16, available: false },
  { date: '2025-04-17', dayOfWeek: 'Cz', dayNum: 17, available: true },
  { date: '2025-04-18', dayOfWeek: 'Pt', dayNum: 18, available: true },
  { date: '2025-04-19', dayOfWeek: 'So', dayNum: 19, available: true, weekend: true },
  { date: '2025-04-20', dayOfWeek: 'Nd', dayNum: 20, available: false, weekend: true },
];

export const Default: Story = {
  render: () => {
    const [sel, setSel] = useState('2025-04-15');
    return <HorizontalDatePicker chips={CHIPS} selected={sel} onSelect={setSel} />;
  },
};
