import type { Preview } from '@storybook/react';
import '../src/global.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'graphite',
      values: [
        { name: 'graphite', value: '#0A0B0E' },
        { name: 'surface', value: '#14171D' },
        { name: 'raised', value: '#1B1E26' },
      ],
    },
    layout: 'centered',
  },
};

export default preview;
