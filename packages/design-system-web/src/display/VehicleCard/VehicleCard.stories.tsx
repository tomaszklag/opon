import type { Meta, StoryObj } from '@storybook/react';
import { VehicleCard } from './VehicleCard';

const meta: Meta<typeof VehicleCard> = {
  title: 'Design System/VehicleCard',
  component: VehicleCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { make: 'Toyota', model: 'Corolla', year: 2019, tireSize: '205/55 R16' },
};
export default meta;

type Story = StoryObj<typeof VehicleCard>;

export const Default: Story = {};
export const DefaultVehicle: Story = { args: { isDefault: true } };
export const WithActions: Story = {
  args: {
    isDefault: true,
    onEdit: () => alert('Edytuj'),
    onDelete: () => alert('Usuń'),
  },
};
