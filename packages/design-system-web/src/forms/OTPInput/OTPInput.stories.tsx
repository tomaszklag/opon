import type { Meta, StoryObj } from '@storybook/react';
import { OTPInput } from './OTPInput';

const meta: Meta<typeof OTPInput> = {
  title: 'Design System/Forms/OTPInput',
  component: OTPInput,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof OTPInput>;

export const Empty: Story = {};

export const Filled: Story = {
  args: { value: '123456' },
};

export const PartiallyFilled: Story = {
  args: { value: '123' },
};

export const WithError: Story = {
  args: { value: '123456', error: true },
};

export const Disabled: Story = {
  args: { value: '123456', disabled: true },
};

export const FourDigit: Story = {
  args: { length: 4 },
};
