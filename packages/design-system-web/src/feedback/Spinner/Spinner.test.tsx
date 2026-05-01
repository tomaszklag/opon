import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default accessible label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<Spinner label="Przetwarzanie…" />);
    expect(screen.getByLabelText('Przetwarzanie…')).toBeInTheDocument();
  });

  it('applies size class — sm', () => {
    render(<Spinner size="sm" />);
    // SVG className is SVGAnimatedString — use classList/toHaveClass
    expect(screen.getByRole('status')).toHaveClass('sm');
  });

  it('applies size class — lg', () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('lg');
  });

  it('applies custom className', () => {
    render(<Spinner className="my-custom" />);
    expect(screen.getByRole('status')).toHaveClass('my-custom');
  });
});
