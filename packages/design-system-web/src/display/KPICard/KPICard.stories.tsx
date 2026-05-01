import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from './KPICard';

const meta: Meta<typeof KPICard> = {
  title: 'Design System/KPICard',
  component: KPICard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof KPICard>;

export const Default: Story = { args: { label: 'Wizyt dziś', value: 7, sub: '+2 vs wczoraj' } };
export const Accent: Story = {
  args: { label: 'Przychód', value: '1 260 zł', sub: 'Dziś', accent: true },
};
export const WithIcon: Story = {
  args: {
    label: 'Oczekujące',
    value: 3,
    accent: true,
    icon: (
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
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
};
