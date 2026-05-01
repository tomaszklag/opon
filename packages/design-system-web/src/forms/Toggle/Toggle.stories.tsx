import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Design System/Forms/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Toggle>;

export const Off: Story = {
  args: { label: 'Powiadomienia e-mail' },
};

export const On: Story = {
  args: { label: 'Powiadomienia e-mail', defaultChecked: true },
};

export const WithDescription: Story = {
  args: {
    label: 'Powiadomienia SMS',
    description: 'Otrzymuj SMS o statusie rezerwacji',
    defaultChecked: true,
  },
};

export const Small: Story = {
  args: { label: 'Kompaktowy widok', size: 'sm' },
};

export const Disabled: Story = {
  args: { label: 'Opcja zablokowana', disabled: true },
};

export const DisabledOn: Story = {
  args: { label: 'Opcja zablokowana (włączona)', defaultChecked: true, disabled: true },
};
