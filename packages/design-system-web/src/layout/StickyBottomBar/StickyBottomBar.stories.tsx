import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { StickyBottomBar } from './StickyBottomBar';

const meta: Meta<typeof StickyBottomBar> = {
  title: 'Design System/StickyBottomBar',
  component: StickyBottomBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof StickyBottomBar>;

export const WithCTA: Story = {
  render: () => (
    <div style={{ minHeight: '200px', position: 'relative' }}>
      <StickyBottomBar>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '2px',
              minWidth: '76px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              Do zapłaty
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '22px',
                color: 'var(--text-primary)',
              }}
            >
              180 <span style={{ color: 'var(--accent)', fontSize: '12px' }}>zł</span>
            </span>
          </div>
          <button
            style={{
              flex: 1,
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              padding: '14px 16px',
            }}
          >
            Potwierdź rezerwację →
          </button>
        </div>
      </StickyBottomBar>
    </div>
  ),
};
