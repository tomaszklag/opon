import type { Meta, StoryObj } from '@storybook/react';
import { NoticeBlock } from './NoticeBlock';

const meta: Meta<typeof NoticeBlock> = {
  title: 'Design System/NoticeBlock',
  component: NoticeBlock,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    children: 'Płatność realizowana jest bezpośrednio w warsztacie. Akceptujemy gotówkę i kartę.',
  },
};
export default meta;

type Story = StoryObj<typeof NoticeBlock>;

export const Info: Story = {};
export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Brak potwierdzenia od warsztatu przez 1h — przypomnienie SMS wysłane.',
  },
};
export const Success: Story = {
  args: { variant: 'success', children: 'Wizyta zakończona. Dziękujemy za skorzystanie z usługi!' },
};
export const Danger: Story = {
  args: { variant: 'danger', children: 'Nie udało się potwierdzić rezerwacji. Spróbuj ponownie.' },
};
