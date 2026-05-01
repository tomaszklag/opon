import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { SearchInput } from './SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Design System/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = { args: { placeholder: 'Szukaj warsztatu lub dzielnicy…' } };

export const WithValue: Story = {
  render: () => {
    const [val, setVal] = useState('Wulkanizacja');
    return (
      <SearchInput
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onClear={() => setVal('')}
        placeholder="Szukaj…"
      />
    );
  },
};
