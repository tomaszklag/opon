import type { Meta, StoryObj } from '@storybook/react';
import { ReviewCard } from './ReviewCard';

const meta: Meta<typeof ReviewCard> = {
  title: 'Design System/ReviewCard',
  component: ReviewCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    authorInitials: 'MK',
    authorName: 'Marek K.',
    rating: 5,
    date: '14 kwi 2025',
    text: 'Świetna robota! Pan Piotr wymienił opony ekspresowo, bez zdejmowania kół z auta. Polecam każdemu.',
  },
};
export default meta;

type Story = StoryObj<typeof ReviewCard>;

export const Default: Story = {};
export const Verified: Story = { args: { verified: true } };
export const WithReply: Story = {
  args: {
    verified: true,
    reply: {
      author: 'Odpowiedź warsztatu',
      text: 'Dziękuję za miłe słowa! Zapraszam na kolejną wymianę 🙏',
      date: '15 kwi 2025',
    },
  },
};
export const LowRating: Story = {
  args: { rating: 2, text: 'Spóźnił się o 40 minut, bez uprzedzenia. Jakość pracy ok.' },
};
