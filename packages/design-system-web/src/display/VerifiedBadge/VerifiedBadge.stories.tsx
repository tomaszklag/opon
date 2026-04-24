import type { Meta, StoryObj } from '@storybook/react';
import { VerifiedBadge } from './VerifiedBadge';

const meta: Meta<typeof VerifiedBadge> = {
  title: 'Design System/VerifiedBadge',
  component: VerifiedBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof VerifiedBadge>;

export const Default: Story = {};
export const CustomLabel: Story = { args: { label: 'Potwierdzone' } };
