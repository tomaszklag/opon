import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { label: 'Numer telefonu', placeholder: '+48 123 456 789', type: 'tel' },
};
export const WithHint: Story = {
  args: {
    label: 'Email',
    placeholder: 'jan@example.com',
    type: 'email',
    hint: 'Wyślemy potwierdzenie',
  },
};
export const WithError: Story = {
  args: { label: 'Telefon', value: 'abc', error: 'Nieprawidłowy numer telefonu', type: 'tel' },
};
export const Disabled: Story = {
  args: { label: 'Imię', value: 'Jan', disabled: true },
};
export const Required: Story = {
  args: { label: 'Rejestracja pojazdu', placeholder: 'KR12345', required: true },
};
export const WithPrefix: Story = {
  args: {
    label: 'Adres',
    placeholder: 'ul. Długa 42, Nowy Sącz',
    prefix: (
      <svg
        width="15"
        height="15"
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
    ),
  },
};
export const WithSuffix: Story = {
  args: {
    label: 'NIP',
    placeholder: '000-000-00-00',
    suffix: (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--success)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
};
