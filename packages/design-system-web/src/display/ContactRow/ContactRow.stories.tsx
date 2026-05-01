import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ContactRow } from './ContactRow';

const PhoneIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const MapIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const meta: Meta<typeof ContactRow> = {
  title: 'Design System/ContactRow',
  component: ContactRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof ContactRow>;

export const Phone: Story = {
  args: {
    icon: <PhoneIcon />,
    label: 'Telefon',
    value: '+48 501 234 789',
    cta: 'Zadzwoń →',
    href: 'tel:+48501234789',
  },
};

export const Address: Story = {
  args: {
    icon: <MapIcon />,
    label: 'Adres',
    value: 'ul. Długa 42, Nowy Sącz',
    cta: 'Nawiguj →',
    href: 'https://maps.google.com',
  },
};

export const WithoutCTA: Story = {
  args: {
    icon: <PhoneIcon />,
    label: 'Telefon',
    value: '+48 501 234 789',
  },
};
