import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Design System/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const TABS = [
  { key: 'upcoming', label: 'Nadchodzące', count: 2 },
  { key: 'history', label: 'Historia', count: 14 },
  { key: 'cancelled', label: 'Anulowane', count: 1 },
];

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('upcoming');
    return <Tabs tabs={TABS} activeKey={active} onChange={setActive} />;
  },
};

export const NoCounts: Story = {
  render: () => {
    const [active, setActive] = useState('all');
    return (
      <Tabs
        tabs={[
          { key: 'all', label: 'Wszystkie' },
          { key: 'pending', label: 'Oczekujące' },
          { key: 'done', label: 'Zrealizowane' },
        ]}
        activeKey={active}
        onChange={setActive}
      />
    );
  },
};
