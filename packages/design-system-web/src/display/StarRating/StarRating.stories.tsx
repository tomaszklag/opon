import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { StarRating } from './StarRating';

const meta: Meta<typeof StarRating> = {
  title: 'Design System/Display/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof StarRating>;

export const Display4: Story = {
  args: { value: 4, readOnly: true },
};

export const Display4Half: Story = {
  args: { value: 4.5, readOnly: true },
};

export const DisplayEmpty: Story = {
  args: { value: 0, readOnly: true },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StarRating value={4} readOnly size="sm" />
      <StarRating value={4} readOnly size="md" />
      <StarRating value={4} readOnly size="lg" />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [rating, setRating] = useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <StarRating value={rating} onChange={setRating} size="lg" />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Ocena: {rating}/5</span>
      </div>
    );
  },
};
