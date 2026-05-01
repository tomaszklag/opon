import type { Meta, StoryObj } from '@storybook/react';
import { PricingTable } from './PricingTable';

const meta: Meta<typeof PricingTable> = {
  title: 'Design System/PricingTable',
  component: PricingTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof PricingTable>;

const ROWS = [
  { id: '1', size: 'Felgi ≤ 15"', price: '140 zł' },
  {
    id: '2',
    size: 'Felgi 16–17"',
    price: '180 zł',
    highlighted: true,
    highlightLabel: 'Twoje opony',
  },
  { id: '3', size: 'Felgi ≥ 18"', price: '240 zł' },
];

export const Default: Story = { args: { rows: ROWS } };
export const WithSurcharge: Story = {
  args: {
    rows: ROWS,
    surcharge: { label: 'Dojazd do 10 km', value: 'w cenie' },
  },
};
