import type { Meta, StoryObj } from '@storybook/react';
import { HoursTable } from './HoursTable';

const meta: Meta<typeof HoursTable> = {
  title: 'Design System/HoursTable',
  component: HoursTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HoursTable>;

const ROWS = [
  { day: 'Poniedziałek', hours: '8:00 – 18:00', isToday: true },
  { day: 'Wtorek', hours: '8:00 – 18:00' },
  { day: 'Środa', hours: '8:00 – 18:00' },
  { day: 'Czwartek', hours: '8:00 – 18:00' },
  { day: 'Piątek', hours: '8:00 – 16:00' },
  { day: 'Sobota', hours: '9:00 – 14:00' },
  { day: 'Niedziela', hours: null },
];

export const Open: Story = { args: { rows: ROWS } };
export const ClosedDay: Story = {
  args: { rows: ROWS.map((r, i) => (i === 0 ? { ...r, hours: null } : r)) },
};
