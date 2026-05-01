import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { SlotGroup } from './TimeSlotPicker';

const meta: Meta<typeof TimeSlotPicker> = {
  title: 'Design System/TimeSlotPicker',
  component: TimeSlotPicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof TimeSlotPicker>;

const GROUPS: SlotGroup[] = [
  {
    label: 'Rano',
    slots: [
      { id: '1', time: '8:00', state: 'taken' },
      { id: '2', time: '8:45', state: 'taken' },
      { id: '3', time: '9:30', state: 'free' },
      { id: '4', time: '10:15', state: 'selected' },
      { id: '5', time: '11:00', state: 'free' },
      { id: '6', time: '11:45', state: 'free' },
    ],
  },
  {
    label: 'Popołudnie',
    slots: [
      { id: '7', time: '13:00', state: 'free' },
      { id: '8', time: '13:45', state: 'free' },
      { id: '9', time: '14:30', state: 'taken' },
      { id: '10', time: '15:15', state: 'free' },
    ],
  },
];

export const Default: Story = {
  render: () => {
    const [groups, setGroups] = useState(GROUPS);
    const handleSelect = (id: string) => {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          slots: g.slots.map((s) => ({
            ...s,
            state: s.id === id ? 'selected' : s.state === 'selected' ? 'free' : s.state,
          })),
        })),
      );
    };
    return <TimeSlotPicker groups={groups} onSelect={handleSelect} />;
  },
};
