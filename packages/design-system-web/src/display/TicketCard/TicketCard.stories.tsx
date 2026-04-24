import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { TicketCard } from './TicketCard';

const CalIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const meta: Meta<typeof TicketCard> = {
  title: 'Design System/TicketCard',
  component: TicketCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof TicketCard>;

export const Default: Story = {
  args: {
    code: 'OPN-4F2K',
    onCopy: () => alert('Skopiowano!'),
    rows: [
      {
        id: 'provider',
        icon: <CalIcon />,
        accentIcon: true,
        label: 'Warsztat',
        value: 'Wulkanizacja Express',
        sub: 'ul. Długa 42, Nowy Sącz',
      },
      {
        id: 'date',
        icon: <CalIcon />,
        label: 'Termin',
        value: 'Piątek, 18 kwietnia 2025',
        sub: '10:00 · ~45 min',
      },
      {
        id: 'price',
        icon: <CalIcon />,
        accentIcon: true,
        label: 'Do zapłaty',
        value: '180 zł',
        sub: 'Gotówka lub karta w warsztacie',
      },
    ],
  },
};
