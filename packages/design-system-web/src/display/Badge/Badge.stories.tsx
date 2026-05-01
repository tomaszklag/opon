import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Pending: Story = { args: { status: 'PENDING' } };
export const Confirmed: Story = { args: { status: 'CONFIRMED' } };
export const Completed: Story = { args: { status: 'COMPLETED' } };
export const Cancelled: Story = { args: { status: 'CANCELLED' } };
export const NoShow: Story = { args: { status: 'NO_SHOW' } };

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Badge status="PENDING" />
      <Badge status="CONFIRMED" />
      <Badge status="COMPLETED" />
      <Badge status="CANCELLED" />
      <Badge status="NO_SHOW" />
    </div>
  ),
};
