import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Design System/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const NoBookings: Story = {
  args: {
    illustration: 'calendar',
    title: 'Brak rezerwacji',
    description: 'Nie masz jeszcze żadnych rezerwacji. Znajdź punkt i umów wizytę.',
    ctaLabel: 'Szukaj punktów',
  },
};

export const EmptySearch: Story = {
  args: {
    illustration: 'search',
    title: 'Brak wyników',
    description: 'Spróbuj zmienić filtry lub wyszukaj w innej lokalizacji.',
  },
};

export const WaitingForClients: Story = {
  args: {
    illustration: 'tire',
    title: 'Czekamy na pierwszych klientów',
    description: 'Twój profil jest aktywny. Rezerwacje pojawią się tutaj.',
  },
};

export const AllDone: Story = {
  args: {
    illustration: 'done',
    title: 'Wszystko gotowe!',
    description: 'Onboarding zakończony. Twój punkt jest widoczny dla klientów.',
    ctaLabel: 'Przejdź do dashboardu',
  },
};
