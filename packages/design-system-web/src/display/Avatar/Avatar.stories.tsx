import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Design System/Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = {
  args: { name: 'Jan Kowalski' },
};

export const SingleName: Story = {
  args: { name: 'Admin' },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/80',
    alt: 'Jan Kowalski',
    name: 'Jan Kowalski',
  },
};

export const Placeholder: Story = {
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar name="Jan Kowalski" size="xs" />
      <Avatar name="Jan Kowalski" size="sm" />
      <Avatar name="Jan Kowalski" size="md" />
      <Avatar name="Jan Kowalski" size="lg" />
      <Avatar name="Jan Kowalski" size="xl" />
    </div>
  ),
};
