import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="Brak rezerwacji" />);
    expect(screen.getByText('Brak rezerwacji')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="Brak" description="Nie masz rezerwacji." />);
    expect(screen.getByText('Nie masz rezerwacji.')).toBeInTheDocument();
  });

  it('renders CTA button when ctaLabel and onCtaClick are provided', () => {
    render(<EmptyState title="Brak" ctaLabel="Szukaj" onCtaClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: /szukaj/i })).toBeInTheDocument();
  });

  it('does not render CTA button without ctaLabel', () => {
    render(<EmptyState title="Brak" onCtaClick={vi.fn()} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<EmptyState title="Brak" ctaLabel="Szukaj" onCtaClick={handleClick} />);
    await user.click(screen.getByRole('button', { name: /szukaj/i }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('has role=status and aria-live=polite', () => {
    render(<EmptyState title="Brak" />);
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('renders SVG illustration', () => {
    const { container } = render(<EmptyState title="Brak" illustration="calendar" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
