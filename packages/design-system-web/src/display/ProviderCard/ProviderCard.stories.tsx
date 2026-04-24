import type { Meta, StoryObj } from '@storybook/react';
import { ProviderCard } from './ProviderCard';

const meta: Meta<typeof ProviderCard> = {
  title: 'Design System/ProviderCard',
  component: ProviderCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    name: 'Szybka Wymiana',
    initials: 'SW',
    rating: 4.5,
    ratingCount: 43,
    priceLabel: 'Cena dla Twoich opon',
    price: '200',
    currency: 'zł',
    priceFor: 'wymiana 4 opon · 205/55 R16',
    nextSlot: 'Jutro 9:00',
    onClick: () => {},
  },
};
export default meta;

type Story = StoryObj<typeof ProviderCard>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    name: 'MobilOpony Kasia',
    photoUrl: 'https://picsum.photos/seed/mobilopony/92/92',
    mobile: true,
    distance: '2,1 km',
    rating: 4.8,
    ratingCount: 127,
    price: '180',
    nextSlot: 'Dziś 16:30',
    nextSlotUrgent: true,
    favorite: true,
    onFavoriteToggle: () => {},
  },
};

export const MobileProvider: Story = {
  args: {
    mobile: true,
    distance: '3,8 km',
    onFavoriteToggle: () => {},
  },
};

export const NoRating: Story = {
  args: {
    name: 'Nowy punkt',
    initials: 'NP',
    rating: undefined,
    ratingCount: undefined,
    nextSlot: 'Sob 10:00',
  },
};
