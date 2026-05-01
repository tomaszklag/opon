import type { Meta, StoryObj } from '@storybook/react';
import { RatingDistribution } from './RatingDistribution';

const meta: Meta<typeof RatingDistribution> = {
  title: 'Design System/RatingDistribution',
  component: RatingDistribution,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof RatingDistribution>;

export const Default: Story = { args: { counts: [104, 13, 5, 3, 2] } };
export const Balanced: Story = { args: { counts: [20, 18, 15, 10, 7] } };
export const AllPerfect: Story = { args: { counts: [50, 0, 0, 0, 0] } };
