import type { Meta, StoryObj } from '@storybook/react';
import { AppHeader } from './AppHeader';
import { Button } from '../../forms/Button';

const meta: Meta<typeof AppHeader> = {
  title: 'Design System/Navigation/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AppHeader>;

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TitleOnly: Story = {
  args: { title: 'Moje rezerwacje' },
};

export const WithBackButton: Story = {
  render: () => (
    <AppHeader
      title="Szczegóły rezerwacji"
      leftSlot={
        <Button variant="ghost" size="sm" aria-label="Wróć">
          <BackIcon />
        </Button>
      }
    />
  ),
};

export const WithActions: Story = {
  render: () => <AppHeader title="Serwisy" rightSlot={<Button size="sm">+ Dodaj</Button>} />,
};

export const WithBothSlots: Story = {
  render: () => (
    <AppHeader
      title="Profil"
      leftSlot={
        <Button variant="ghost" size="sm" aria-label="Wróć">
          <BackIcon />
        </Button>
      }
      rightSlot={
        <Button variant="ghost" size="sm">
          Edytuj
        </Button>
      }
    />
  ),
};
