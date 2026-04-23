import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Design System/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  args: { label: 'Akceptuję regulamin serwisu' },
};

export const Checked: Story = {
  args: { label: 'Zgadzam się z polityką prywatności', defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: 'Opcja niedostępna', disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: 'Zaznaczone i zablokowane', defaultChecked: true, disabled: true },
};

export const WithError: Story = {
  args: { label: 'Akceptuję regulamin', error: 'Musisz zaakceptować regulamin' },
};

export const NoLabel: Story = {
  args: {},
};
