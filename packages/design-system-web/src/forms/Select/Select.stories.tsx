import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Design System/Forms/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Select>;

const cityOptions = [
  { value: 'nowy-sacz', label: 'Nowy Sącz' },
  { value: 'krakow', label: 'Kraków' },
  { value: 'warszawa', label: 'Warszawa' },
];

const serviceOptions = [
  { value: 'wymiana', label: 'Wymiana opon' },
  { value: 'wyważanie', label: 'Wyważanie kół' },
  { value: 'geometria', label: 'Geometria' },
  { value: 'przechowanie', label: 'Przechowanie opon', disabled: true },
];

export const Default: Story = {
  args: { label: 'Miasto', options: cityOptions, placeholder: 'Wybierz miasto' },
};

export const WithValue: Story = {
  args: { label: 'Miasto', options: cityOptions, defaultValue: 'nowy-sacz' },
};

export const WithHint: Story = {
  args: {
    label: 'Usługa',
    options: serviceOptions,
    placeholder: 'Wybierz usługę',
    hint: 'Wybierz typ usługi którą chcesz zamówić',
  },
};

export const WithError: Story = {
  args: {
    label: 'Usługa',
    options: serviceOptions,
    placeholder: 'Wybierz usługę',
    error: 'To pole jest wymagane',
  },
};

export const Required: Story = {
  args: { label: 'Miasto', options: cityOptions, placeholder: 'Wybierz miasto', required: true },
};

export const Disabled: Story = {
  args: { label: 'Miasto', options: cityOptions, defaultValue: 'nowy-sacz', disabled: true },
};
