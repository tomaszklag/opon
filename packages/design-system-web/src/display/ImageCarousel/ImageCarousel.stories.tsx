import type { Meta, StoryObj } from '@storybook/react';
import { ImageCarousel } from './ImageCarousel';

const meta: Meta<typeof ImageCarousel> = {
  title: 'Design System/ImageCarousel',
  component: ImageCarousel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ImageCarousel>;

const IMAGES = [
  { src: 'https://placehold.co/600x300/1B1E26/FF6B1A?text=Warsztat+1', alt: 'Widok warsztatu' },
  {
    src: 'https://placehold.co/600x300/23272F/FF6B1A?text=Stanowisko',
    alt: 'Stanowisko do wymiany',
  },
  { src: 'https://placehold.co/600x300/14171D/FF6B1A?text=Sprzęt', alt: 'Sprzęt diagnostyczny' },
];

export const MultiImage: Story = { args: { images: IMAGES } };
export const Single: Story = { args: { images: [IMAGES[0]!] } };
