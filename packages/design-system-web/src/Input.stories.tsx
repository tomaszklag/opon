import type { Meta, StoryObj } from '@storybook/react';
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
