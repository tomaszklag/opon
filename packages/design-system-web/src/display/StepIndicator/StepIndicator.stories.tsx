import type { Meta, StoryObj } from '@storybook/react';
import { StepIndicator } from './StepIndicator';

const meta: Meta<typeof StepIndicator> = {
  title: 'Design System/Display/StepIndicator',
  component: StepIndicator,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof StepIndicator>;

const bookingSteps = [
  { label: 'Wybierz serwis', status: 'done' as const },
  { label: 'Wybierz termin', status: 'done' as const },
  { label: 'Potwierdź dane', status: 'active' as const },
  { label: 'Gotowe', status: 'upcoming' as const },
];

export const Step3of4: Story = {
  args: { steps: bookingSteps },
};

export const FirstStep: Story = {
  args: {
    steps: [
      { label: 'Wybierz serwis', status: 'active' },
      { label: 'Wybierz termin', status: 'upcoming' },
      { label: 'Potwierdź dane', status: 'upcoming' },
      { label: 'Gotowe', status: 'upcoming' },
    ],
  },
};

export const AllDone: Story = {
  args: {
    steps: [
      { label: 'Wybierz serwis', status: 'done' },
      { label: 'Wybierz termin', status: 'done' },
      { label: 'Potwierdź dane', status: 'done' },
      { label: 'Gotowe', status: 'done' },
    ],
  },
};

export const ThreeSteps: Story = {
  args: {
    steps: [
      { label: 'Dane', status: 'done' },
      { label: 'Kod SMS', status: 'active' },
      { label: 'Gotowe', status: 'upcoming' },
    ],
  },
};
