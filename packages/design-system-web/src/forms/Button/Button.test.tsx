import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Zarezerwuj</Button>);
    expect(screen.getByRole('button', { name: /zarezerwuj/i })).toBeInTheDocument();
  });

  it('applies primary variant class by default', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('primary');
  });

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('secondary');
  });

  it('applies ghost variant class', () => {
    render(<Button variant="ghost">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('ghost');
  });

  it('is disabled and aria-busy when loading', () => {
    render(<Button loading>Ładowanie</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Test</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Kliknij</Button>);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Kliknij
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('fullWidth');
  });

  it('applies sm size class', () => {
    render(<Button size="sm">S</Button>);
    expect(screen.getByRole('button')).toHaveClass('sm');
  });

  it('applies lg size class', () => {
    render(<Button size="lg">L</Button>);
    expect(screen.getByRole('button')).toHaveClass('lg');
  });
});
