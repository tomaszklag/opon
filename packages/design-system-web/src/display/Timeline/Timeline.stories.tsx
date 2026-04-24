import type { Meta, StoryObj } from '@storybook/react';
import { Timeline } from './Timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Design System/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Timeline>;

const EVENTS = [
  { id: '1', label: 'Rezerwacja złożona', time: 'Wt 15 kwi · 10:32', state: 'done' as const },
  {
    id: '2',
    label: 'Potwierdzono przez warsztat',
    time: 'Wt 15 kwi · 10:47',
    state: 'done' as const,
  },
  {
    id: '3',
    label: 'Wizyta zaplanowana',
    time: 'Pt 18 kwi · 10:00',
    sub: 'Za 3 dni',
    state: 'current' as const,
  },
  { id: '4', label: 'Wizyta zrealizowana', state: 'future' as const },
  { id: '5', label: 'Zostaw opinię', state: 'future' as const },
];

export const Default: Story = { args: { events: EVENTS } };
export const AllDone: Story = {
  args: {
    events: EVENTS.map((e) => ({ ...e, state: 'done' as const })),
  },
};
