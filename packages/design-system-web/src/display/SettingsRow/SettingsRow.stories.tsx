import type { Meta, StoryObj } from '@storybook/react';
import { SettingsRow } from './SettingsRow';

const BellIcon = () => (
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
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const meta: Meta<typeof SettingsRow> = {
  title: 'Design System/SettingsRow',
  component: SettingsRow,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Powiadomienia push', icon: <BellIcon /> },
};
export default meta;

type Story = StoryObj<typeof SettingsRow>;

export const Default: Story = {};
export const WithSub: Story = { args: { sub: 'Przypomnienia o wizytach i promocje' } };
export const Danger: Story = {
  args: { label: 'Usuń konto', sub: 'Operacja nieodwracalna', danger: true },
};
