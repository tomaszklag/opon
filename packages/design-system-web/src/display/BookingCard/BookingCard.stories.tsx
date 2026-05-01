import type { Meta, StoryObj } from '@storybook/react';
import { BookingCard } from './BookingCard';

const meta: Meta<typeof BookingCard> = {
  title: 'Design System/BookingCard',
  component: BookingCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    status: 'CONFIRMED' as const,
    providerName: 'Wulkanizacja Express',
    providerAddress: 'ul. Długa 42, Nowy Sącz',
    providerInitials: 'WE',
    datetime: 'Pt 18 kwi · 10:00',
    duration: '~45 min',
    price: '180 zł',
    onClick: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof BookingCard>;

export const Confirmed: Story = { args: { status: 'CONFIRMED', urgentLabel: 'Za 3 dni' } };
export const Pending: Story = {
  args: { status: 'PENDING', urgentLabel: 'Oczekuje na potwierdzenie' },
};
export const Completed: Story = { args: { status: 'COMPLETED', paid: true } };
export const Cancelled: Story = { args: { status: 'CANCELLED' } };
export const Mobile: Story = { args: { status: 'CONFIRMED', mobile: true, urgentLabel: 'Jutro' } };
