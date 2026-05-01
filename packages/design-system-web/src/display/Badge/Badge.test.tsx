import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders default Polish label for PENDING', () => {
    render(<Badge status="PENDING" />);
    expect(screen.getByText('Oczekuje')).toBeInTheDocument();
  });

  it('renders default label for CONFIRMED', () => {
    render(<Badge status="CONFIRMED" />);
    expect(screen.getByText('Potwierdzona')).toBeInTheDocument();
  });

  it('renders default label for COMPLETED', () => {
    render(<Badge status="COMPLETED" />);
    expect(screen.getByText('Zrealizowana')).toBeInTheDocument();
  });

  it('renders default label for CANCELLED', () => {
    render(<Badge status="CANCELLED" />);
    expect(screen.getByText('Anulowana')).toBeInTheDocument();
  });

  it('renders default label for NO_SHOW', () => {
    render(<Badge status="NO_SHOW" />);
    expect(screen.getByText('Nieobecność')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<Badge status="PENDING" label="Czeka" />);
    expect(screen.getByText('Czeka')).toBeInTheDocument();
  });

  it('has accessible aria-label with status', () => {
    render(<Badge status="CONFIRMED" />);
    expect(screen.getByLabelText(/Status: Potwierdzona/i)).toBeInTheDocument();
  });

  it('applies status-specific CSS class', () => {
    const { container } = render(<Badge status="CANCELLED" />);
    expect(container.firstChild).toHaveClass('cancelled');
  });
});
