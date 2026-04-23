'use client';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BottomTabBar, type TabId } from './BottomTabBar';

const meta: Meta<typeof BottomTabBar> = {
  title: 'Design System/BottomTabBar',
  component: BottomTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof BottomTabBar>;

function Demo({ initial }: { initial: TabId }) {
  const [active, setActive] = useState<TabId>(initial);
  return (
    <div style={{ width: 390 }}>
      <BottomTabBar activeTab={active} onTabChange={setActive} />
    </div>
  );
}

export const Search: Story = { render: () => <Demo initial="search" /> };
export const Bookings: Story = { render: () => <Demo initial="bookings" /> };
export const Profile: Story = { render: () => <Demo initial="profile" /> };
