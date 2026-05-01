import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    children: (
      <div>
        <p style={{ color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-body)' }}>
          Wulkanizacja Express
        </p>
        <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13 }}>
          ul. Długa 42, Nowy Sącz
        </p>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};
export const Hoverable: Story = { args: { hoverable: true } };
export const Clickable: Story = { args: { hoverable: true, onClick: () => alert('Kliknięto!') } };
export const WithAccent: Story = { args: { accent: true } };
export const AccentClickable: Story = {
  args: { accent: true, hoverable: true, onClick: () => alert('Kliknięto!') },
};
