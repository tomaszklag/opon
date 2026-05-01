import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Design System/Forms/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { label: 'Opis', placeholder: 'Wpisz opis...' },
};

export const WithCounter: Story = {
  args: { label: 'Uwagi do rezerwacji', placeholder: 'Wpisz uwagi...', maxLength: 300 },
};

export const WithHint: Story = {
  args: {
    label: 'Notatka',
    hint: 'Maksymalnie 500 znaków',
    placeholder: 'Wpisz notatkę...',
    maxLength: 500,
  },
};

export const WithError: Story = {
  args: {
    label: 'Powód anulowania',
    error: 'To pole jest wymagane',
    placeholder: 'Wpisz powód...',
  },
};

export const Required: Story = {
  args: { label: 'Komentarz', required: true, placeholder: 'Wpisz komentarz...' },
};

export const Disabled: Story = {
  args: {
    label: 'Opis',
    defaultValue: 'Wymiana 4 opon letnich na zimowe',
    disabled: true,
  },
};
