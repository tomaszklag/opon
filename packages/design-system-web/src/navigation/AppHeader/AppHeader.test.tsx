import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders title', () => {
    render(<AppHeader title="Moje rezerwacje" />);
    expect(screen.getByRole('heading', { name: 'Moje rezerwacje' })).toBeInTheDocument();
  });

  it('renders left slot', () => {
    render(<AppHeader leftSlot={<button>Back</button>} />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders right slot', () => {
    render(<AppHeader rightSlot={<button>Edit</button>} />);
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders both slots', () => {
    render(<AppHeader leftSlot={<span>left</span>} rightSlot={<span>right</span>} />);
    expect(screen.getByText('left')).toBeInTheDocument();
    expect(screen.getByText('right')).toBeInTheDocument();
  });

  it('renders as header landmark', () => {
    render(<AppHeader title="Test" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<AppHeader leftSlot={<span>back</span>} />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
