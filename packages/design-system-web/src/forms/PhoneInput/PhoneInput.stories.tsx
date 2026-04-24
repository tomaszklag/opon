import type { Meta, StoryObj } from '@storybook/react';
import { PhoneInput } from './PhoneInput';

const meta: Meta<typeof PhoneInput> = {
  title: 'Design System/PhoneInput',
  component: PhoneInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Numer telefonu', placeholder: '*** *** ***' },
};
export default meta;

type Story = StoryObj<typeof PhoneInput>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: '501 234 789', hint: 'Wyślemy 6-cyfrowy kod SMS.' } };
export const WithError: Story = { args: { value: '123', error: 'Nieprawidłowy numer telefonu.' } };
