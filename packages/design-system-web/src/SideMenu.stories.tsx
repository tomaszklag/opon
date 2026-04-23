import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SideMenu } from './SideMenu';

const meta: Meta<typeof SideMenu> = {
  title: 'Design System/SideMenu',
  component: SideMenu,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SideMenu>;

export const Default: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <SideMenu activeItem="dashboard" />
    </div>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <SideMenu activeItem="bookings" isCollapsed />
    </div>
  ),
};

export const BookingsActive: Story = {
  render: () => (
    <div style={{ height: 480 }}>
      <SideMenu activeItem="bookings" />
    </div>
  ),
};
